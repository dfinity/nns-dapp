export const downloadBlob = async (src: string): Promise<Blob> => {
  const wasm: Response = await fetch(src);
  return wasm.blob();
};
