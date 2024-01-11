import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { isUniverseCkBTC, isUniverseNns } from "$lib/utils/universe.utils";
import { TokenAmount, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { selectedUniverseIdStore } from "../selected-universe.derived";

// TS was not smart enough to infer the type of the stores, so we need to specify them
export const snsSelectedTransactionFeeStore: Readable<TokenAmount | undefined> =
  derived(
    [selectedUniverseIdStore, tokensStore, icrcCanistersStore],
    ([selectedRootCanisterId, tokensStore, icrcCanisters]) => {
      const selectedToken = tokensStore[selectedRootCanisterId.toText()]?.token;
      // Only return fee for SNS projects
      if (
        isUniverseNns(selectedRootCanisterId) ||
        isUniverseCkBTC(selectedRootCanisterId) ||
        nonNullish(icrcCanisters[selectedRootCanisterId.toText()])
      ) {
        return undefined;
      }
      if (nonNullish(selectedToken)) {
        return TokenAmount.fromE8s({
          amount: selectedToken.fee,
          token: selectedToken,
        });
      }
    }
  );
