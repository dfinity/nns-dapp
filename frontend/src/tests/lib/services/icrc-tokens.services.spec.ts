import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { watchIcrcTokensLoadTokenData } from "$lib/services/icrc-tokens.services";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { get } from "svelte/store";

vi.mock("$lib/api/icrc-ledger.api");

describe("icrc-tokens.services", () => {
  describe("watchIcrcTokensLoadTokenData", () => {
    const ledgerCanisterId1 = principal(0);
    const ledgerCanisterId2 = principal(1);
    const indexCanisterId = principal(2);
    const token1 = mockToken;
    const token2 = { ...mockToken, name: "Token 2" };

    beforeEach(() => {
      icrcCanistersStore.reset();
      tokensStore.reset();
      vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockImplementation(
        async ({ canisterId }) => {
          if (canisterId.toText() === ledgerCanisterId1.toText()) {
            return token1;
          } else if (canisterId.toText() === ledgerCanisterId2.toText()) {
            return token2;
          }
        }
      );
    });

    it("should load tokens when icrcCanistersStore is updated", async () => {
      watchIcrcTokensLoadTokenData();

      icrcCanistersStore.setCanisters({
        ledgerCanisterId: ledgerCanisterId1,
        indexCanisterId,
      });

      await runResolvedPromises();

      expect(get(tokensStore)[ledgerCanisterId1.toText()]).toEqual({
        certified: false,
        token: token1,
      });
    });

    it("should load multiple tokens when icrcCanistersStore is updated multiple times", async () => {
      watchIcrcTokensLoadTokenData();

      icrcCanistersStore.setCanisters({
        ledgerCanisterId: ledgerCanisterId1,
        indexCanisterId,
      });

      icrcCanistersStore.setCanisters({
        ledgerCanisterId: ledgerCanisterId2,
        indexCanisterId,
      });

      await runResolvedPromises();

      expect(get(tokensStore)[ledgerCanisterId1.toText()]).toEqual({
        certified: false,
        token: token1,
      });

      expect(get(tokensStore)[ledgerCanisterId2.toText()]).toEqual({
        certified: false,
        token: token2,
      });
    });
  });
});
