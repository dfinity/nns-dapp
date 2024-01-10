import * as ledgerApi from "$lib/api/wallet-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { getAccounts } from "$lib/services/wallet-loader.services";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { waitFor } from "@testing-library/svelte";

describe("wallet-loader-services", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccounts", () => {
    it("should call get CkBTC account", async () => {
      const spyGetCkBTCAccount = vi
        .spyOn(ledgerApi, "getAccount")
        .mockResolvedValue(mockCkBTCMainAccount);

      await getAccounts({
        identity: mockIdentity,
        certified: true,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      await waitFor(() =>
        expect(spyGetCkBTCAccount).toBeCalledWith({
          identity: mockIdentity,
          certified: true,
          canisterId: CKBTC_UNIVERSE_CANISTER_ID,
          owner: mockIdentity.getPrincipal(),
          type: "main",
        })
      );
    });
  });
});
