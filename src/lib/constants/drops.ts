/**
 * Define the static drop information to process each of the available NFTs to mint
 */

import { SITE_DESCRIPTION, SITE_URL, TWITTER } from "./general";
import bh from "../../../assets/bh.json";
import recife from "../../../assets/recife.json";
import vitoria from "../../../assets/vitoria.json";

/**
 * Type for the statically defined NFT details
 */
type MintableNFTDetails = {
  // todo:
  // price: number;
  // priceToken: "sol";
  startDate?: Date;
  endDate?: Date;
  metadataUri: string;
  metadata: {
    name: string;
    image: string;
    description?: string;
    symbol?: string;
    seller_fee_basis_points?: number;
    isMutable?: boolean;
    external_url?: string;
    collection?: {
      name: string;
      family: string;
    };
    properties: {
      category?: "image";
      files: Array<{
        uri: string;
        type: "image/png" | "image/jpeg" | "image/gif";
      }>;
      creators?: Array<{
        address: string;
        share: number;
      }>;
    };
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
};

/**
 * Collection treasure address
 *
 * pro tip: use a multi sig protocol like Squads for your treasure address
 */
export const TREASURY_ADDRESS = "";

/**
 * Tree and collection address to mint the NFTs to
 */
export const COLLECTION_DETAILS = {
  /**
   * Collection address to use while minting
   *
   * NOTE: this should be owned by the `SOLANA_KEYPAIR` to ensure we can mint to the collection
   */
  collectionAddress: process.env.SOLANA_COLLECTION_ADDRESS,

  /**
   * Tree address to use while minting
   *
   * NOTE: this should be owned by the `SOLANA_KEYPAIR` to ensure we can write to the tree
   */
  treeAddress: process.env.SOLANA_TREE_ADDRESS,
};

/**
 * Define the default metadata to be used when minting these NFTs
 */
export const GENERIC_METADATA_DEFAULTS = {
  symbol: "GENIN",
  name: "Genin Minter",
  collection: {
    name: "Genin Minter",
    family: "geninminter",
  },
  description: SITE_DESCRIPTION,
  external_url: TWITTER.website,
  isMutable: true,
  seller_fee_basis_points: 0,
  properties: {
    category: "image",
    creators: !TREASURY_ADDRESS
      ? [] // use a blank a array when no treasury address is set
      : [
          {
            address: TREASURY_ADDRESS,
            share: 100,
          },
        ],
  },
};

/**
 * Define a static listing of NFTs to allow minting
 */
export const STATIC_NFT_ITEMS: Record<string, MintableNFTDetails> = {
  bh: {
    metadataUri:
      "https://bafkreiafruwdve5xk4fyxmlhbbciyzpugujftzxu4sgcvoosvgu5djhr6e.ipfs.nftstorage.link/",
    metadata: {
      name: "Supermeet - Belo Horizonte",
      external_url: bh.external_url,
      description: bh.description,
      image: bh.image,
      symbol: bh.symbol,
      properties: {
        files: bh.properties.files as any,
        category: bh.properties.category as any,
        creators: bh.properties.creators as any,
      },
      attributes: bh.properties.attributes as any,
    },
  },
  recife: {
    metadataUri:
      "https://bafkreiafruwdve5xk4fyxmlhbbciyzpugujftzxu4sgcvoosvgu5djhr6e.ipfs.nftstorage.link/",
    metadata: {
      name: recife.name,
      external_url: recife.external_url,
      description: recife.description,
      image: recife.image,
      symbol: recife.symbol,
      properties: {
        files: recife.properties.files as any,
        category: recife.properties.category as any,
        creators: recife.properties.creators as any,
      },
      attributes: recife.properties.attributes as any,
    },
  },
  vitoria: {
    metadataUri:
      "https://bafkreiafruwdve5xk4fyxmlhbbciyzpugujftzxu4sgcvoosvgu5djhr6e.ipfs.nftstorage.link/",
    metadata: {
      name: vitoria.name,
      external_url: vitoria.external_url,
      description: vitoria.description,
      image: vitoria.image,
      symbol: vitoria.symbol,
      properties: {
        files: vitoria.properties.files as any,
        category: vitoria.properties.category as any,
        creators: vitoria.properties.creators as any,
      },
      attributes: vitoria.properties.attributes as any,
    },
  },
};
