/**
 * Define general constants for use around the entire site/app
 */

export const SITE_NAME = "Genin Minter";

export const SITE_DESCRIPTION =
  "Demo application to mint compressed NFTs using Solana Pay QR codes.";

export const SITE_URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000"
    : process.env?.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://genin.com.br";

/**
 * Twitter information for the site
 */
export const TWITTER = {
  handle: "@superteambr",
  username: "superteambr",
  url: "https://twitter.com/superteambr",
  website: "https://superteam.com.br",
};
