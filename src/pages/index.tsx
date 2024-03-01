import { useSearchParams } from "next/navigation";
import DefaultLayout from "@/layouts/DefaultLayout";
import { NextSeoProps } from "next-seo";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef } from "react";
import { createQR, encodeURL } from "@solana/pay";
import { LinkCardGrid } from "@/components/LinkCard";
import { NoticeMessage, DevnetNotice } from "@/components/NoticeMessage";

// define a static size for the qr code
const QR_CODE_SIZE = 350;

const seo: NextSeoProps = {
  // comment for better diffs
  // title: "Demo application",
  // title: "Mint cNFTs using Solana Pay",
};

export default function Page() {
  const searchParams = useSearchParams();

  const event = searchParams.get("event") || "";
  // define a ref to populate the qr code in the ui
  const solanaPayQrRef = useRef<HTMLDivElement>();

  console.log(event);

  // generate the SolanaPay qr code on the client only (e.g. within useEffect)
  useEffect(() => {
    // make the site root the mint url
    const { location } = window;
    const apiUrl = `${location.protocol}//${location.host}/api/mint`;
    const encodedURL = encodeURL({
      link: new URL(apiUrl),
    });

    const qrLink =
      process.env.NEXT_PUBLIC_WALLET_URL +
      encodeURIComponent(encodedURL.pathname);

    // setApiUrl(apiUrl);
    console.log(qrLink);

    // generate the SolanaPay QR code
    const solanaPayQr = createQR(
      // encode the url with the desired params
      encodeURL({
        link: new URL(apiUrl),
      }),
      // set the svg image size
      QR_CODE_SIZE,
      // background color
      "transparent",
      // "#141414",
      // foreground color
      "white",
    );

    // set the generated QR code on the QR ref element
    if (solanaPayQrRef.current) {
      solanaPayQrRef.current.innerHTML = "";
      solanaPayQr.append(solanaPayQrRef.current);
    }
  }, [event]);

  return (
    <DefaultLayout seo={seo}>
      <div className="">
        <div className="mb-10 space-y-10">
          <p className={styles.tagline}>
            Scan with your camera to mint an NFT
            <br />
            in Genin wallet
          </p>
        </div>

        <div className="items-center justify-center space-y-10">
          <DevnetNotice>
            <NoticeMessage>
              This app is connected to Solana&apos;s{" "}
              <span className="underline">devnet</span>.
              <br />
              Please ensure <span className="underline">your wallet</span> is
              connected to devnet.
            </NoticeMessage>
          </DevnetNotice>

          <div
            ref={solanaPayQrRef as any}
            className={`qrBox w-[${QR_CODE_SIZE}px] h-[${QR_CODE_SIZE}px]`}
          ></div>
        </div>
      </div>
    </DefaultLayout>
  );
}
