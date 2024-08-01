import {
  getImportedTokens,
  setImportedTokens,
} from "$lib/api/imported-tokens.api";
import { TooManyImportedTokensError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { ImportedTokens } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { MAX_IMPORTED_TOKENS } from "$lib/constants/imported-tokens.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import {
  fromImportedTokenData,
  toImportedTokenData,
} from "$lib/utils/imported-tokens.utils";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { queryAndUpdate } from "./utils.services";

/** Load imported tokens from the `nns-dapp` backend and update the `importedTokensStore` store.
 * - Displays an error toast if the operation fails.
 */
export const loadImportedTokens = async () => {
  return queryAndUpdate<ImportedTokens, unknown>({
    request: (options) => getImportedTokens(options),
    strategy: FORCE_CALL_STRATEGY,
    onLoad: ({ response: { imported_tokens: rawImportTokens }, certified }) => {
      const importedTokens = rawImportTokens.map(toImportedTokenData);
      importedTokensStore.set({
        importedTokens,
        certified,
      });

      const icrcCanistersStoreData = get(icrcCanistersStore);
      for (const { ledgerCanisterId, indexCanisterId } of importedTokens) {
        if (isNullish(icrcCanistersStoreData[ledgerCanisterId.toText()])) {
          icrcCanistersStore.setCanisters({
            ledgerCanisterId,
            indexCanisterId,
          });
        }
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (!certified && notForceCallStrategy()) {
        return;
      }

      // Explicitly handle only UPDATE errors
      importedTokensStore.reset();

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
  // TODO: validate importedToken (not sns, not ck, is unique, etc.)

  const tokens = [...importedTokens, tokenToAdd];
  const { err } = await saveImportedToken({ tokens });

  if (isNullish(err)) {
    await loadImportedTokens();
    toastsSuccess({
      labelKey: "import_token.add_imported_token_success",
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
 * Remove imported tokens and reload imported tokens from the `nns-dapp` backend to update the `importedTokensStore`.
 *  - Displays a success toast if the operation is successful.
 *  - Displays an error toast if the operation fails.
 */
export const removeImportedTokens = async ({
  tokensToRemove,
  importedTokens,
}: {
  tokensToRemove: ImportedTokenData[];
  importedTokens: ImportedTokenData[];
}): Promise<{ success: boolean }> => {
  const canisterIdsToRemove = tokensToRemove.map(
    ({ ledgerCanisterId }) => ledgerCanisterId
  );
  // Compare imported tokens by their ledgerCanisterId because they should be unique.
  const ledgerIdsToRemove = new Set(
    canisterIdsToRemove.map((id) => id.toText())
  );
  const tokens = importedTokens.filter(
    ({ ledgerCanisterId }) => !ledgerIdsToRemove.has(ledgerCanisterId.toText())
  );
  const { err } = await saveImportedToken({ tokens });

  if (isNullish(err)) {
    // TODO: update unit test to check if icrcCanistersStore.removeCanisters is called
    icrcCanistersStore.removeCanisters(canisterIdsToRemove);

    await loadImportedTokens();
    toastsSuccess({
      labelKey: "import_token.remove_imported_token_success",
    });

    return { success: true };
  }

  toastsError({
    labelKey: "error__imported_tokens.remove_imported_token",
    err,
  });

  return { success: false };
};
