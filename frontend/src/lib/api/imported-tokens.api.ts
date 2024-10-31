import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import type {
  ImportedToken,
  ImportedTokens,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";

export const getImportedTokens = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<ImportedTokens> => {
  logWithTimestamp(`Getting imported tokens:${certified} call...`);

  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  const response = await nnsDapp.getImportedTokens({ certified });

  logWithTimestamp(`Getting imported tokens:${certified} complete`);

  return response;
};

export const setImportedTokens = async ({
  identity,
  importedTokens,
}: {
  identity: Identity;
  importedTokens: Array<ImportedToken>;
}): Promise<void> => {
  logWithTimestamp("Setting imported tokens call...");

  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  await nnsDapp.setImportedTokens(importedTokens);

  logWithTimestamp("Setting imported tokens call complete.");
};
