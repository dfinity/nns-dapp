/**
 * @jest-environment jsdom
 */

import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { page } from "$mocks/$app/stores";
import { Principal } from "@dfinity/principal";
import { SnsMetadataResponseEntries, SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { snsResponsesForLifecycle } from "../../../mocks/sns-response.mock";

describe("snsSelectedTransactionFeeStore", () => {
  const data = snsResponsesForLifecycle({
    lifecycles: [SnsSwapLifecycle.Open],
    certified: true,
  });
  afterEach(() => {
    snsQueryStore.reset();
    page.mock({ data: { universe: mockPrincipal.toText() } });
  });
  it("returns transaction fee of current selected sns project", () => {
    snsQueryStore.setData(data);
    const [metadatas] = data;
    page.mock({ data: { universe: metadatas[0].rootCanisterId } });
    const ledgerMetadata = metadatas[0].token;
    const symbolResponse = ledgerMetadata.find(
      (metadata) => metadata[0] === SnsMetadataResponseEntries.SYMBOL
    );
    const symbol =
      symbolResponse !== undefined && "Text" in symbolResponse[1]
        ? symbolResponse[1].Text
        : undefined;

    const fee = BigInt(10_000);
    transactionsFeesStore.setFee({
      rootCanisterId: Principal.fromText(metadatas[0].rootCanisterId),
      fee,
      certified: true,
    });

    const actualFeeTokens = get(snsSelectedTransactionFeeStore);

    expect(actualFeeTokens?.toE8s()).toBe(fee);
    expect(actualFeeTokens?.token.symbol).toBe(symbol);
  });

  it("returns undefined if selected project is NNS", () => {
    snsQueryStore.setData(data);
    page.mock({ data: { universe: mockPrincipal.toText() } });
    const actualFeeTokens = get(snsSelectedTransactionFeeStore);

    expect(actualFeeTokens).toBeUndefined();
  });

  it("returns undefined if current selected project has no data", () => {
    const [metadatas] = data;
    page.mock({ data: { universe: metadatas[0].rootCanisterId } });
    const actualFeeTokens = get(snsSelectedTransactionFeeStore);

    expect(actualFeeTokens).toBeUndefined();
  });
});
