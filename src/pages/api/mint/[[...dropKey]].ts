/**
 * Mint NFTs to a collection
 *
 * note: this endpoint should always return a response that supports the SolanaPay spec!
 */

import { debug } from "@/lib/utils/logs";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import type { NextApiRequest, NextApiResponse } from "next";
import { SOLANA_KEYPAIR } from "@/lib/solana/general";
import { SolanaConnection } from "@/lib/solana/SolanaConnection";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  buildSolanaPayGetResponse,
  buildSolanaPayPostResponse,
} from "@/lib/solana/SolanaPay";
import { buildMintCompressedNftTransaction } from "@/lib/solana/compression";
import {
  TokenProgramVersion,
  TokenStandard,
  MetadataArgs,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  COLLECTION_DETAILS,
  GENERIC_METADATA_DEFAULTS,
  STATIC_NFT_ITEMS,
} from "@/lib/constants/drops";
import { buildTransaction } from "@/lib/solana/transactions";
import event from "next-seo/lib/jsonld/event";

/**
 * the SolanaPay spec only supports GET and POST requests
 *
 * For unwanted request methods, we will send an error JSON response,
 * but one that still supports the SolanaPay GET spec so users will
 * see some sort of error message in their wallet app
 * (since it is unknown how wallets/clients will handle the headers)
 */

type EventName = "bh" | "recife" | "vitoria" | "brasilia" | "mendoza";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // set the default headers for all responses
    res.setHeader("content-type", "application/json");
    req.method = req.method?.toLocaleLowerCase();

    const { event }: { event?: EventName } = req.query;
    // accept a `full` query param to aid in controlling the data sent to the client
    const fullData = typeof req.query?.full !== "undefined";

    if (event) {
      // randomly select an NFT to mint from the static listing within this app
      const nftToMint = STATIC_NFT_ITEMS[event];
      // STATIC_NFT_ITEMS[Math.floor(Math.random() * STATIC_NFT_ITEMS.length)];
      if (!nftToMint) throw Error(`unable to locate NFT to mint`);

      /**
       * define the metadata to be used for the specific nft the user is about to mint
       */
      const compressedNFTMetadata: MetadataArgs = {
        name: nftToMint.metadata.name,
        // @ts-ignore
        uri: nftToMint.metadataUri,
        symbol: nftToMint.metadata.symbol || GENERIC_METADATA_DEFAULTS.symbol,
        isMutable:
          nftToMint.metadata.isMutable || GENERIC_METADATA_DEFAULTS.isMutable,
        // massage the creators array into a valid format
        creators: GENERIC_METADATA_DEFAULTS.properties.creators.map((item) => {
          return {
            address: new PublicKey(item.address),
            share: item.share,
            verified: false,
          };
        }),
        sellerFeeBasisPoints:
          nftToMint.metadata.seller_fee_basis_points ||
          GENERIC_METADATA_DEFAULTS.seller_fee_basis_points,
        collection: {
          key: new PublicKey(COLLECTION_DETAILS.collectionAddress),
          // note: when minting to collection v1, this nft will be auto verified
          // (when the tx is signed by the collection authority)
          verified: false,
        },
        uses: null,
        primarySaleHappened: true,
        editionNonce: null,
        tokenStandard: TokenStandard.NonFungible,
        tokenProgramVersion: TokenProgramVersion.Original,
      };

      // send the full drop data as the response when debugging
      if (!!process.env?.NEXT_PUBLIC_DEBUG && !!fullData) {
        return res
          .status(200)
          .json(Object.assign(nftToMint, { metadata: compressedNFTMetadata }));
      }

      /**
       * GET requests do not required any additional processing,
       * so we can safely send the response to the client now :)
       */
      if (req.method != "post") {
        return res.status(200).json(
          Object.assign(
            buildSolanaPayGetResponse({
              message: STATIC_NFT_ITEMS[event].metadata.name,
              label: SITE_NAME,
              icon: STATIC_NFT_ITEMS[event].metadata.image,
            }),
            // send drop's metadata to the client (when desired)
            !!fullData && nftToMint,
          ),
        );
      }

      /**
       * complete processing of the POST request to generate the transaction for the user to mint
       */

      // extract the desired body input
      const { account } = req.body;

      // validate the input `account` (aka the receiver of the drop)
      if (!account) throw Error("'account' is required");
      const userAccount = new PublicKey(account);
      if (userAccount.toBase58() !== account)
        throw Error("unable to parse 'account'");

      // create the connection to the desired solana cluster
      const connection = new SolanaConnection();

      const accountInfo = await connection
        .getAccountInfo(userAccount)
        .catch(() => null);

      if (!accountInfo?.lamports) {
        const lamports = await connection.getMinimumBalanceForRentExemption(16);

        const tx = await buildTransaction({
          connection,
          signers: [SOLANA_KEYPAIR],
          payerKey: SOLANA_KEYPAIR.publicKey,
          instructions: [
            SystemProgram.transfer({
              fromPubkey: SOLANA_KEYPAIR.publicKey,
              toPubkey: userAccount,
              lamports,
              programId: SystemProgram.programId,
            }),
          ],
        });

        await connection.sendTransaction(tx);
        debug("userAccount created:", tx);
      }

      // build the transaction
      const transaction = await buildMintCompressedNftTransaction({
        connection,
        // note: to have your app pay the fee, set this to `SOLANA_KEYPAIR.publicKey`,
        feePayer: userAccount,

        treeAddress: new PublicKey(COLLECTION_DETAILS.treeAddress),
        nftOwner: userAccount,
        compressedNFTMetadata,

        collectionMint: new PublicKey(COLLECTION_DETAILS.collectionAddress),
        collectionAuthority: SOLANA_KEYPAIR.publicKey,

        // force override the metadata uri with a url of on the site's domain
        // useAtaAddressAsMetadataUri: true,
      });

      // transaction.sign([SOLANA_KEYPAIR]);
      debug("transaction:", transaction);

      /**
       * Handle the SolanaPay post request:
       * - partially sign the transaction
       * - return the serialized/base64 encode transaction via JSON
       */
      return res.status(200).json(
        buildSolanaPayPostResponse({
          message: STATIC_NFT_ITEMS[event].metadata.name, // drop.metadata.name - should we show the nft name?,
          transaction,
          signers: [SOLANA_KEYPAIR],
        }),
      );
      /**********************************************************************
       * Congrats, the user will now have a transaction to sign
       ***********************************************************************/
    }
  } catch (err) {
    console.warn(err);
  }

  // always send a response to the client
  // (one that should be parsable via the Solana Pay spec)
  return res.status(400).json({
    success: false,
    ...buildSolanaPayGetResponse({
      label: "Unknown mint. Expect a failure.",
      message: "An error ocurred while locating the NFT to mint.",
    }),
  });
}
