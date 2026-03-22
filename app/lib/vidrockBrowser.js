/**
 * Matches VidrockExtractor.kt: AES/CBC/PKCS5Padding, passphrase as key (32 bytes), IV = first 16 bytes of key.
 * Output: Base64 URL-safe, no padding (Android Base64.URL_SAFE | NO_PADDING | NO_WRAP).
 */
export async function vidrockEncodePath(plaintext) {
  const passphrase = "x7k9mPqT2rWvY8zA5bC3nF6hJ2lK4mN9";
  const keyBytes = new TextEncoder().encode(passphrase);
  const iv = keyBytes.slice(0, 16);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt"]
  );
  const enc = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  );
  return base64UrlNoPadding(new Uint8Array(enc));
}

function base64UrlNoPadding(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
