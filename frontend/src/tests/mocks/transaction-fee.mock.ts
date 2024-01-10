import { TokenAmount } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";

export const mockSnsSelectedTransactionFeeStoreSubscribe =
  (notDefined = false) =>
  (run: Subscriber<TokenAmount>): (() => void) => {
    run(
      notDefined
        ? undefined
        : TokenAmount.fromE8s({
            amount: 10_000n,
            token: { name: "Test", symbol: "TST", decimals: 8 },
          })
    );
    return () => undefined;
  };
