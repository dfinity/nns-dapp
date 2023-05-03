/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-accounts-loader.services";
import { getCkBTCWithdrawalAccount } from "$lib/services/ckbtc-accounts-loader.services";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkBTCWithdrawalAccount, mockCkBTCWithdrawalIcrcAccount,
  mockCkBTCWithdrawalIdentifier,
} from "$tests/mocks/ckbtc-accounts.mock";
import { TokenAmount } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";
import {decodeIcrcAccount} from "@dfinity/ledger";

describe("ckbtc-accounts-loader-services", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getCkBTCAccounts", () => {
    it("should call get CkBTC account", async () => {
      const spyGetCkBTCAccount = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockResolvedValue(mockCkBTCMainAccount);

      await services.getCkBTCAccounts({
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

  describe("getCkBTCWithdrawalAccount", () => {
    let spyGetCkBTCAccount;

    const params = {
      identity: mockIdentity,
      certified: true,
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
    };

    const mockAccountBalance = TokenAmount.fromString({
      amount: "123.666",
      token: mockCkBTCToken,
    }) as TokenAmount;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();

      ckBTCWithdrawalAccountsStore.reset();

      spyGetCkBTCAccount = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockResolvedValue({
          ...mockCkBTCWithdrawalAccount,
          balance: mockAccountBalance,
        });
    });

    it("should throw no minter found for incompatible universe", () => {
      const call = () =>
        getCkBTCWithdrawalAccount({
          ...params,
          universeId: OWN_CANISTER_ID,
        });

      expect(call).rejects.toThrowError();
    });

    it("should return type minter if query call", async () => {
      const result = await getCkBTCWithdrawalAccount({
        ...params,
        certified: false,
      });

      expect(result.type).toEqual("withdrawalAccount");
    });

    it("should return empty account if query call and unknown withdrawal account", async () => {
      const result = await getCkBTCWithdrawalAccount({
        ...params,
        certified: false,
      });

      expect(result.identifier).toBeUndefined();
      expect(result.balance).toBeUndefined();

      expect(spyGetCkBTCAccount).not.toHaveBeenCalled();
    });

    it("should return withdrawal account with updated balance for query call", async () => {
      ckBTCWithdrawalAccountsStore.set({
        account: {
          account: mockCkBTCWithdrawalAccount,
          certified: true,
        },
        universeId: params.universeId,
      });

      const result = await getCkBTCWithdrawalAccount({
        ...params,
        certified: false,
      });

      expect(result.identifier).toEqual(mockCkBTCWithdrawalIdentifier);
      expect(result.balance.toE8s()).toEqual(mockAccountBalance.toE8s());

      expect(spyGetCkBTCAccount).toHaveBeenCalledWith({
        identity: params.identity,
        certified: false,
        canisterId: params.universeId,
        ...mockCkBTCWithdrawalIcrcAccount,
        "type": "withdrawalAccount",
      });
    });
  });
});
