export const sha256 = async (blob: Blob): Promise<string> => {
  const uint8Array = new Uint8Array(await blob.arrayBuffer());
  const hashBuffer = await crypto.subtle.digest("SHA-256", uint8Array);

  // https://stackoverflow.com/a/74573524/5404186
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((h) => h.toString(16).padStart(2, "0")).join("");
};
