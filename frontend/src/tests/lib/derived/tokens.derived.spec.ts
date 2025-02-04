import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import {
  tokensByLedgerCanisterIdStore,
  tokensByUniverseIdStore,
} from "$lib/derived/tokens.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockCkBTCToken } from "$tests/mocks/ckbtc-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("tokens.derived", () => {
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
    tokensStore.setToken({
      canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      token: mockCkBTCToken,
      certified: true,
    });
  });

  describe("tokensByUniverseIdStore", () => {
    it("should hold tokens mappend by root canister id", () => {
      const tokens = get(tokensByUniverseIdStore);
      expect(tokens).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: mockCkBTCToken,
        [batmanRootCanisterIdText]: batmanToken,
        [robinRootCanisterIdText]: robinToken,
        [OWN_CANISTER_ID_TEXT]: NNS_TOKEN_DATA,
      });
    });
  });

  describe("tokensByLedgerCanisterIdStore", () => {
    it("should hold tokens mappend by ledger canister id", () => {
      const tokens = get(tokensByLedgerCanisterIdStore);
      expect(tokens).toEqual({
        [CKBTC_LEDGER_CANISTER_ID.toText()]: mockCkBTCToken,
        [batmanLedgerCanisterIdText]: batmanToken,
        [robinLedgerCanisterIdText]: robinToken,
        [LEDGER_CANISTER_ID.toText()]: NNS_TOKEN_DATA,
      });
    });
  });
});
