import {
  getImportedTokens,
  setImportedTokens,
} from "$lib/api/imported-tokens.api";
import {
  AccountNotFoundError,
  TooManyImportedTokensError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { ImportedTokens } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { MAX_IMPORTED_TOKENS } from "$lib/constants/imported-tokens.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { isLastCall } from "$lib/utils/env.utils";
import {
  fromImportedTokenData,
  toImportedTokenData,
} from "$lib/utils/imported-tokens.utils";
import type { Principal } from "@dfinity/principal";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

/** Load imported tokens from the `nns-dapp` backend and update the `importedTokensStore` store.
 * - Displays an error toast if the operation fails.
 */
export const loadImportedTokens = async ({
  ignoreAccountNotFoundError,
}: {
  ignoreAccountNotFoundError?: boolean;
} = {}) => {
  return queryAndUpdate<ImportedTokens, unknown>({
    request: (options) => getImportedTokens(options),
    strategy: FORCE_CALL_STRATEGY,
    onLoad: ({ response: { imported_tokens: importedTokens }, certified }) => {
      importedTokensStore.set({
        importedTokens: importedTokens.map(toImportedTokenData),
        certified,
      });
      failedImportedTokenLedgerIdsStore.reset();
    },
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (ignoreAccountNotFoundError && err instanceof AccountNotFoundError) {
        // When you log in with a new account for the first time, the account is created in the NNS dapp.
        // If you request imported tokens before the account is created, an `AccountNotFound` error will be thrown.
        // In this case, we can be sure that the user has no imported tokens.
        importedTokensStore.set({
          importedTokens: [],
          certified,
        });
        return;
      }

      if (!isLastCall({ strategy, certified })) {
        return;
      }

      // Explicitly handle only UPDATE errors
      importedTokensStore.reset();
      failedImportedTokenLedgerIdsStore.reset();

      toastsError({
        labelKey: "error__imported_tokens.load_imported_tokens",
        err,
      });
    },
    logMessage: "Get Imported Tokens",
  });
};

// Save imported tokens to the nns-dapp backend.
// Returns an error if the operation fails.
const saveImportedToken = async ({
  tokens,
}: {
  tokens: ImportedTokenData[];
}): Promise<{ err: Error | undefined }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    const importedTokens = tokens.map(fromImportedTokenData);
    await setImportedTokens({ identity, importedTokens });
  } catch (err) {
    return { err: err as Error };
  }

  return { err: undefined };
};

/**
 * Add new imported token and reload imported tokens from the `nns-dapp` backend to update the `importedTokensStore`.
 *  - Displays a success toast if the operation is successful.
 *  - Displays an error toast if the operation fails.
 */
export const addImportedToken = async ({
  tokenToAdd,
  importedTokens,
}: {
  tokenToAdd: ImportedTokenData;
  importedTokens: ImportedTokenData[];
}): Promise<{ success: boolean }> => {
  const tokens = [...importedTokens, tokenToAdd];
  const { err } = await saveImportedToken({ tokens });

  if (isNullish(err)) {
    await loadImportedTokens();
    toastsSuccess({
      labelKey: "tokens.add_imported_token_success",
    });

    return { success: true };
  }

  if (err instanceof TooManyImportedTokensError) {
    toastsError({
      labelKey: "error__imported_tokens.too_many",
      substitutions: { $limit: `${MAX_IMPORTED_TOKENS}` },
    });
  } else {
    toastsError({
      labelKey: "error__imported_tokens.add_imported_token",
      err,
    });
  }

  return { success: false };
};

/**
 * Add index canister ID to imported token.
 * Note: This service function assumes the indexCanisterId is valid and matches the ledgerCanisterId.
 *  - Displays a success toast if the operation is successful.
 *  - Displays an error toast if the operation fails.
 */
export const addIndexCanister = async ({
  ledgerCanisterId,
  indexCanisterId,
  importedTokens,
}: {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal;
  importedTokens: ImportedTokenData[];
}): Promise<{ success: boolean }> => {
  const tokens = importedTokens.map((token) =>
    token.ledgerCanisterId.toText() === ledgerCanisterId.toText()
      ? { ...token, indexCanisterId }
      : token
  );

  const { err } = await saveImportedToken({ tokens });

  if (isNullish(err)) {
    await loadImportedTokens();
    toastsSuccess({
      labelKey: "tokens.update_imported_token_success",
    });

    return { success: true };
  }

  toastsError({
    labelKey: "error__imported_tokens.update_imported_token",
    err,
  });

  return { success: false };
};

/**
 * Remove imported tokens and reload imported tokens from the `nns-dapp` backend to update the `importedTokensStore`.
 *  - Displays a success toast if the operation is successful.
 *  - Displays an error toast if the operation fails.
 */
export const removeImportedTokens = async (
  ledgerCanisterId: Principal
): Promise<{ success: boolean }> => {
  try {
    startBusy({
      initiator: "import-token-removing",
      labelKey: "import_token.removing",
    });

    const remainingTokens = (
      get(importedTokensStore).importedTokens ?? []
    ).filter(
      ({ ledgerCanisterId: id }) => id.toText() !== ledgerCanisterId.toText()
    );
    const { err } = await saveImportedToken({ tokens: remainingTokens });

    if (isNullish(err)) {
      // There is no need to reload imported tokens if the remove operation is successful.
      importedTokensStore.remove(ledgerCanisterId);
      failedImportedTokenLedgerIdsStore.remove(ledgerCanisterId.toText());

      toastsSuccess({
        labelKey: "tokens.remove_imported_token_success",
      });

      return { success: true };
    }

    toastsError({
      labelKey: "error__imported_tokens.remove_imported_token",
      err,
    });

    return { success: false };
  } finally {
    stopBusy("import-token-removing");
  }
};
