import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import { snsAggregatorIncludingAbortedProjectsStore } from "$lib/stores/sns-aggregator.store";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { get } from "svelte/store";

describe("snsAggregatorDerived", () => {
  it("should create a derived store", () => {
    const rootCanisterId = "3uikt-kqsgq-aaaaa-aaaaa-cai";
    const ledgerCanisterId = "zjv33-2isgu-aaaaa-aaaaa-cai";

    const snsLedgerCanisterIdStore = snsAggregatorDerived(
      (sns) => sns.canister_ids.ledger_canister_id
    );

    expect(get(snsLedgerCanisterIdStore)).toEqual({});

    snsAggregatorIncludingAbortedProjectsStore.setData([
      {
        ...aggregatorSnsMockDto,
        canister_ids: {
          ...aggregatorSnsMockDto.canister_ids,
          root_canister_id: rootCanisterId,
          ledger_canister_id: ledgerCanisterId,
        },
      },
    ]);

    expect(get(snsLedgerCanisterIdStore)).toEqual({
      [rootCanisterId]: ledgerCanisterId,
    });
  });
});
