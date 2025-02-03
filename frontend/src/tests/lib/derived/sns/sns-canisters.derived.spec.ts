import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns-canisters.derived", () => {
  const batmanRootCanisterIdText = "aax3a-h4aaa-aaaaa-qaahq-cai";
  const batmanRootCanisterId = Principal.fromText(batmanRootCanisterIdText);
  const batmanLedgerCanisterIdText = "c2lt4-zmaaa-aaaaa-qaaiq-cai";
  const batmanLedgerCanisterId = Principal.fromText(batmanLedgerCanisterIdText);
  const robinRootCanisterIdText = "ctiya-peaaa-aaaaa-qaaja-cai";
  const robinRootCanisterId = Principal.fromText(robinRootCanisterIdText);
  const robinLedgerCanisterIdText = "cpmcr-yeaaa-aaaaa-qaala-cai";
  const robinLedgerCanisterId = Principal.fromText(robinLedgerCanisterIdText);

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: batmanRootCanisterId,
        ledgerCanisterId: batmanLedgerCanisterId,
      },
      {
        rootCanisterId: robinRootCanisterId,
        ledgerCanisterId: robinLedgerCanisterId,
      },
    ]);
  });

  describe("snsLedgerCanisterIdsStore", () => {
    it("should map root canister ids to ledger canister ids", () => {
      expect(get(snsLedgerCanisterIdsStore)).toEqual({
        [batmanRootCanisterIdText]: batmanLedgerCanisterId,
        [robinRootCanisterIdText]: robinLedgerCanisterId,
      });
    });
  });
});
