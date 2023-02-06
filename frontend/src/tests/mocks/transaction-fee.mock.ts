import { TokenAmount } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";

export const mockSnsSelectedTransactionFeeStoreSubscribe =
  (notDefined = false) =>
  (run: Subscriber<TokenAmount>): (() => void) => {
    run(
      notDefined
        ? undefined
        : TokenAmount.fromE8s({
            amount: BigInt(10_000),
            token: { name: "Test", symbol: "TST" },
          })
    );
    return () => undefined;
  };
