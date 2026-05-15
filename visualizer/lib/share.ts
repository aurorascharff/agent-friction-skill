/**
 * URL-fragment encoding for sharable log views.
 *
 * Logs travel as a base64url-encoded `#log=<payload>` fragment on the
 * `/view` route. The fragment never reaches the server — no privacy
 * surface, no server storage. Gzip-via-CompressionStream when supported,
 * plain UTF-8 otherwise.
 */

export const SHARE_FRAGMENT_KEY = "log";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array {
  const pad = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function gzip(text: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  const stream = new Blob([encoded.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

export async function encodeShare(text: string): Promise<string> {
  if (typeof CompressionStream === "undefined") {
    return "u:" + toBase64Url(new TextEncoder().encode(text));
  }
  const gz = await gzip(text);
  return "g:" + toBase64Url(gz);
}

export async function decodeShare(fragment: string): Promise<string> {
  if (fragment.startsWith("g:")) {
    return gunzip(fromBase64Url(fragment.slice(2)));
  }
  if (fragment.startsWith("u:")) {
    return new TextDecoder().decode(fromBase64Url(fragment.slice(2)));
  }
  return new TextDecoder().decode(fromBase64Url(fragment));
}

export function readShareFragment(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get(SHARE_FRAGMENT_KEY);
}
