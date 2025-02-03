import {
  snsTokensByLedgerCanisterIdStore,
  snsTokensByRootCanisterIdStore,
} from "$lib/derived/sns/sns-tokens.derived";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import {
  setProdSnsProjects,
  setSnsProjects,
} from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns-tokens.derived", () => {
  const batmanRootCanisterIdText = "aax3a-h4aaa-aaaaa-qaahq-cai";
  const batmanLedgerCanisterIdText = "c2lt4-zmaaa-aaaaa-qaaiq-cai";
  const robinRootCanisterIdText = "ctiya-peaaa-aaaaa-qaaja-cai";
  const robinLedgerCanisterIdText = "cpmcr-yeaaa-aaaaa-qaala-cai";

  const batmanToken = {
    ...mockSnsToken,
    name: "Batman",
    symbol: "BAT",
    fee: 10_700n,
  };

  const robinToken = {
    ...mockSnsToken,
    name: "Robin",
    symbol: "ROB",
    fee: 10_800n,
  };

  beforeEach(() => {
    setSnsProjects([
      {
        rootCanisterId: Principal.fromText(batmanRootCanisterIdText),
        ledgerCanisterId: Principal.fromText(batmanLedgerCanisterIdText),
        tokenMetadata: batmanToken,
      },
      {
        rootCanisterId: Principal.fromText(robinRootCanisterIdText),
        ledgerCanisterId: Principal.fromText(robinLedgerCanisterIdText),
        tokenMetadata: robinToken,
      },
    ]);
  });

  describe("snsTokensByRootCanisterIdStore", () => {
    it("should hold tokens mappend by root canister id", () => {
      const tokens = get(snsTokensByRootCanisterIdStore);
      expect(tokens).toEqual({
        [batmanRootCanisterIdText]: batmanToken,
        [robinRootCanisterIdText]: robinToken,
      });
    });

    it("should convert prod SNSes without error", async () => {
      await setProdSnsProjects();
      const store = get(snsTokensByRootCanisterIdStore);
      expect(Object.keys(store).length).toBeGreaterThan(25);
    });
  });

  describe("snsTokensByLedgerCanisterIdStore", () => {
    it("should hold tokens mappend by ledger canister id", () => {
      const tokens = get(snsTokensByLedgerCanisterIdStore);
      expect(tokens).toEqual({
        [batmanLedgerCanisterIdText]: batmanToken,
        [robinLedgerCanisterIdText]: robinToken,
      });
    });
  });
});
