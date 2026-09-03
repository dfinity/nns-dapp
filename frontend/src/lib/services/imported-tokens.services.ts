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
import {
  queryAndUpdate,
  type QueryAndUpdateStrategy,
} from "$lib/services/utils.services";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import {
  failedImportedTokenLedgerIdsStore,
  importedTokensStore,
} from "$lib/stores/imported-tokens.store";
import {
  toastsError,
  toastsShow,
  toastsSuccess,
} from "$lib/stores/toasts.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { isLastCall } from "$lib/utils/env.utils";
import {
  fromImportedTokenData,
  isImportedToken,
  isImportedTokensCertified,
  toImportedTokenData,
} from "$lib/utils/imported-tokens.utils";
import { isNullish } from "@dfinity/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { get } from "svelte/store";

/** Load imported tokens from the `nns-dapp` backend and update the `importedTokensStore` store.
 * - Displays an error toast if the operation fails.
 * - `strategy` selects the calls to make. The default makes a query call and an
 *   update call, and the returned promise settles on the first response.
 *   `"update"` makes only the update call, so the returned promise settles on
 *   the certified response.
 */
export const loadImportedTokens = async ({
  ignoreAccountNotFoundError,
  strategy = FORCE_CALL_STRATEGY,
}: {
  ignoreAccountNotFoundError?: boolean;
  strategy?: QueryAndUpdateStrategy;
} = {}) => {
  return queryAndUpdate<ImportedTokens, unknown>({
    request: (options) => getImportedTokens(options),
    strategy,
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

/**
 * Return the imported tokens that a certified call produced.
 *
 * A write replaces the whole imported-token list. It must never build the
 * replacement from a query response, because a single replica can forge or drop
 * entries. If the store holds a query response, reload the imported tokens
 * first.
 *
 * The reload uses the `"update"` strategy. A `"query_and_update"` reload
 * settles on the query response, which leaves the store uncertified and blocks
 * a normal write. A session that forces the `query` strategy keeps its query
 * response, because `isImportedTokensCertified` accepts it.
 *
 * Return `undefined` when certified imported tokens are not available. An empty
 * list is a valid result. An absent list is not.
 */
export const getCertifiedImportedTokens = async (): Promise<
  ImportedTokenData[] | undefined
> => {
  if (!isImportedTokensCertified(get(importedTokensStore).certified)) {
    try {
      await loadImportedTokens({
        ignoreAccountNotFoundError: true,
        strategy: "update",
      });
    } catch (err) {
      console.error(err);
      return undefined;
    }
  }

  const { importedTokens, certified } = get(importedTokensStore);

  if (!isImportedTokensCertified(certified) || isNullish(importedTokens)) {
    return undefined;
  }

  return importedTokens;
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
}: {
  tokenToAdd: ImportedTokenData;
}): Promise<{ success: boolean }> => {
  const importedTokens = await getCertifiedImportedTokens();

  if (isNullish(importedTokens)) {
    toastsError({ labelKey: "error__imported_tokens.not_certified" });
    return { success: false };
  }

  // The certified list already holds the token. Report it instead of saving a
  // duplicate entry.
  if (
    isImportedToken({
      ledgerCanisterId: tokenToAdd.ledgerCanisterId,
      importedTokens,
      filterOutImportantCkToken: false,
    })
  ) {
    toastsShow({
      level: "warn",
      labelKey: "error__imported_tokens.is_duplication",
    });
    return { success: false };
  }

  const tokens = [...importedTokens, tokenToAdd];
  const { err } = await saveImportedToken({ tokens });

  if (isNullish(err)) {
    // Reload with the `"update"` strategy. A query call can still return the
    // imported tokens from before this write. The `"update"` strategy also
    // leaves the store certified, so the next write needs no extra reload.
    await loadImportedTokens({ strategy: "update" });
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
}: {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal;
}): Promise<{ success: boolean }> => {
  const importedTokens = await getCertifiedImportedTokens();

  if (isNullish(importedTokens)) {
    toastsError({ labelKey: "error__imported_tokens.not_certified" });
    return { success: false };
  }

  // The certified list does not hold the token to update. Report it instead of
  // saving an unchanged list.
  if (
    !isImportedToken({
      ledgerCanisterId,
      importedTokens,
      filterOutImportantCkToken: false,
    })
  ) {
    toastsError({ labelKey: "error__imported_tokens.token_not_found" });
    return { success: false };
  }

  const tokens = importedTokens.map((token) =>
    token.ledgerCanisterId.toText() === ledgerCanisterId.toText()
      ? { ...token, indexCanisterId }
      : token
  );

  const { err } = await saveImportedToken({ tokens });

  if (isNullish(err)) {
    // Reload with the `"update"` strategy. A query call can still return the
    // imported tokens from before this write. The `"update"` strategy also
    // leaves the store certified, so the next write needs no extra reload.
    await loadImportedTokens({ strategy: "update" });
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

    const importedTokens = await getCertifiedImportedTokens();

    if (isNullish(importedTokens)) {
      toastsError({ labelKey: "error__imported_tokens.not_certified" });
      return { success: false };
    }

    // The certified list does not hold the token to remove. Report it instead
    // of saving an unchanged list.
    if (
      !isImportedToken({
        ledgerCanisterId,
        importedTokens,
        filterOutImportantCkToken: false,
      })
    ) {
      toastsError({ labelKey: "error__imported_tokens.token_not_found" });
      return { success: false };
    }

    const remainingTokens = importedTokens.filter(
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
