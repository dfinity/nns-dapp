import { TokenAmountV2 } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

export const mockSnsSelectedTransactionFeeStoreSubscribe =
  (notDefined = false) =>
  (run: Subscriber<TokenAmountV2>): (() => void) => {
    run(
      notDefined
        ? undefined
        : TokenAmountV2.fromUlps({
            amount: 10_000n,
            token: { name: "Test", symbol: "TST", decimals: 8 },
          })
    );
    return () => undefined;
  };
