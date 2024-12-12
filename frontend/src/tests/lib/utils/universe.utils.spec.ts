import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { nnsUniverseStore } from "$lib/derived//nns-universe.derived";
import { ckBTCUniverseStore } from "$lib/derived/ckbtc-universe.derived";
import { snsSummariesStore } from "$lib/stores/sns.store";
import {
  createUniverse,
  getLedgerCanisterIdFromUniverse,
} from "$lib/utils/universe.utils";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("universe.utils", () => {
  describe("getLedgerCanisterIdFromUniverse", () => {
    const nnsUniverse = get(nnsUniverseStore);
    const ckBtcUniverse = get(ckBTCUniverseStore);

    it("should return the ledger canister ID for the NNS universe", () => {
      expect(getLedgerCanisterIdFromUniverse(nnsUniverse)).toBe(
        LEDGER_CANISTER_ID
      );
    });

    it("should return the ledger canister ID for the ckBTC universe", () => {
      expect(getLedgerCanisterIdFromUniverse(ckBtcUniverse).toText()).toBe(
        CKBTC_LEDGER_CANISTER_ID.toText()
      );
    });

    it("should return the ledger canister ID for an SNS universe", () => {
      const rootCanisterId = principal(0);
      const ledgerCanisterId = principal(1);
      setSnsProjects([
        {
          rootCanisterId,
          ledgerCanisterId,
        },
      ]);
      const snsSummaries = get(snsSummariesStore);
      expect(snsSummaries).toHaveLength(1);
      const snsUniverse = createUniverse(snsSummaries[0]);
      expect(getLedgerCanisterIdFromUniverse(snsUniverse).toText()).toBe(
        ledgerCanisterId.toText()
      );
    });
  });
});
