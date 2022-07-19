import type { SnsWasmCanister, SnsWasmCanisterOptions } from "@dfinity/nns";
import type { InitSnsWrapper } from "@dfinity/sns";

export interface SnsWasmCanisterCreate {
  create: (options: SnsWasmCanisterOptions) => SnsWasmCanister;
}

export const importSnsWasmCanister =
  async (): Promise<SnsWasmCanisterCreate> => {
    const {
      SnsWasmCanister,
    }: {
      SnsWasmCanister: {
        create: (options: SnsWasmCanisterOptions) => SnsWasmCanister;
      };
    } = await import("@dfinity/nns/dist/esm/sns_wasm.canister");
    return SnsWasmCanister;
  };

export const importInitSns = async (): Promise<InitSnsWrapper> => {
  const { initSnsWrapper }: { initSnsWrapper: InitSnsWrapper } = await import(
    "@dfinity/sns/dist/esm/sns"
  );
  return initSnsWrapper;
};
