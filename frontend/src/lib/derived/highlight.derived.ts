import { authSignedInStore } from "$lib/derived/auth.derived";
import { snsProjectsRecordStore } from "$lib/derived/sns/sns-projects.derived";
import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
import { isUserTokenData } from "$lib/utils/user-token.utils";
import { nonNullish, TokenAmountV2 } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const shouldShowHighlightForSnsTopics: Readable<boolean> = derived(
  [authSignedInStore, tokensListUserStore, snsProjectsRecordStore],
  ([isSignedIn, tokensListUserStore, snsProjectsRecordStore]) => {
    const listOfSnsTokensWithBalance = tokensListUserStore
      .filter(isUserTokenData)
      .filter(
        ({ balance }) =>
          balance instanceof TokenAmountV2 && balance.toUlps() > 0n
      )
      .filter(({ universeId }) =>
        nonNullish(snsProjectsRecordStore?.[universeId.toText()])
      );

    // add check for feature flag??
    return isSignedIn && listOfSnsTokensWithBalance.length > 0;
  }
);
