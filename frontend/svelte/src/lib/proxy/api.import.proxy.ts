import type { SnsWasmCanister, SnsWasmCanisterOptions } from "@dfinity/nns";
import type { InitSns } from "@dfinity/sns";

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

export const importInitSns = async (): Promise<InitSns> => {
  const { initSns }: { initSns: InitSns } = await import(
    "@dfinity/sns/dist/esm/sns"
  );
  return initSns;
};
