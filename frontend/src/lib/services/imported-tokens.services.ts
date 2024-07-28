import {
  getImportedTokens,
  setImportedTokens,
} from "$lib/api/imported-tokens.api";
import { TooManyImportedTokensError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { ImportedTokens } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { MAX_IMPORTED_TOKENS } from "$lib/constants/imported-tokens.constants";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import {
  fromImportedTokenData,
  toImportedTokenData,
} from "$lib/utils/imported-tokens.utils";
import { queryAndUpdate } from "./utils.services";

export const loadImportedTokens = async () => {
  return queryAndUpdate<ImportedTokens, unknown>({
    request: (options) => getImportedTokens(options),
    strategy: FORCE_CALL_STRATEGY,
    onLoad: ({ response: { imported_tokens: importedTokens }, certified }) =>
      importedTokensStore.set({
        importedTokens: importedTokens.map(toImportedTokenData),
        certified,
      }),
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

export const addImportedToken = async ({
  tokenToAdd,
  tokens,
}: {
  tokenToAdd: ImportedTokenData;
  tokens: ImportedTokenData[];
}) => {
  // TODO: validate importedToken (not sns, not ck, is unique, etc.)

  try {
    const identity = await getAuthenticatedIdentity();
    const importedTokens = [...tokens, tokenToAdd].map(fromImportedTokenData);

    await setImportedTokens({ identity, importedTokens });
    await loadImportedTokens();

    toastsSuccess({
      labelKey: "tokens.add_imported_token_success",
    });
  } catch (err: unknown) {
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
  }

  return { success: true };
};
