import { TokenAmount } from "@dfinity/nns";
import type { Subscriber } from "svelte/store";

export const mockSnsSelectedTransactionFeeStoreSubscribe =
  () =>
  (run: Subscriber<TokenAmount>): (() => void) => {
    run(
      TokenAmount.fromE8s({
        amount: BigInt(10_000),
        token: { name: "Test", symbol: "TST" },
      })
    );
    return () => undefined;
  };
