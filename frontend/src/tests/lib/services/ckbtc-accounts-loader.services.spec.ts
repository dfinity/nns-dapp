/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-accounts-loader.services";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { waitFor } from "@testing-library/svelte";

describe("ckbtc-accounts-loader-services", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getCkBTCAccounts", () => {
    it("should call get CkBTC account", async () => {
      const spyEstimateFee = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockResolvedValue(mockCkBTCMainAccount);

      await services.getCkBTCAccounts({
        identity: mockIdentity,
        certified: true,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      await waitFor(() =>
        expect(spyEstimateFee).toBeCalledWith({
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
