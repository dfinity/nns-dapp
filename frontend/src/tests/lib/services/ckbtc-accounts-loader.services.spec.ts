/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-accounts-loader.services";
import { getCkBTCWithdrawalAccount } from "$lib/services/ckbtc-accounts-loader.services";
import * as minterServices from "$lib/services/ckbtc-minter.services";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIcrcAccount,
  mockCkBTCWithdrawalIdentifier,
} from "$tests/mocks/ckbtc-accounts.mock";
import { TokenAmount } from "@dfinity/nns";
import { waitFor } from "@testing-library/svelte";

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

      ckBTCWithdrawalAccountsStore.reset();
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

    describe("get account success", () => {
      let spyGetCkBTCAccount;

      beforeEach(() => {
        spyGetCkBTCAccount = jest
          .spyOn(ledgerApi, "getCkBTCAccount")
          .mockResolvedValue({
            ...mockCkBTCWithdrawalAccount,
            balance: mockAccountBalance,
          });
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
          type: "withdrawalAccount",
        });
      });

      describe("withdrawal success", () => {
        let spyGetWithdrawalAccount;

        beforeEach(() => {
          spyGetWithdrawalAccount = jest
            .spyOn(minterServices, "getWithdrawalAccount")
            .mockResolvedValue({
              owner: mockCkBTCWithdrawalIcrcAccount.owner,
              subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
            });
        });

        it("should return withdrawal account with update calls", async () => {
          const result = await getCkBTCWithdrawalAccount(params);

          expect(result.identifier).toEqual(mockCkBTCWithdrawalIdentifier);
          expect(result.balance.toE8s()).toEqual(mockAccountBalance.toE8s());

          expect(spyGetCkBTCAccount).toHaveBeenCalledWith({
            identity: params.identity,
            certified: true,
            canisterId: params.universeId,
            ...mockCkBTCWithdrawalIcrcAccount,
            type: "withdrawalAccount",
          });
        });

        it("should not call get withdrawal if already in store", async () => {
          ckBTCWithdrawalAccountsStore.set({
            account: {
              account: mockCkBTCWithdrawalAccount,
              certified: true,
            },
            universeId: params.universeId,
          });

          await getCkBTCWithdrawalAccount(params);

          expect(spyGetWithdrawalAccount).not.toHaveBeenCalled();
        });
      });

      describe("withdrawal error", () => {
        let spyGetWithdrawalAccount;

        beforeEach(() => {
          spyGetWithdrawalAccount = jest
            .spyOn(minterServices, "getWithdrawalAccount")
            .mockRejectedValue(new Error());
        });

        it("should not call get account", async () => {
          const call = () => getCkBTCWithdrawalAccount(params);

          expect(call).rejects.toThrowError();

          expect(spyGetCkBTCAccount).not.toBeCalled();
        });
      });
    });

    describe("get account error", () => {
      let spyOnToastsError;

      beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => undefined);
        jest.spyOn(ledgerApi, "getCkBTCAccount").mockRejectedValue(new Error());

        spyOnToastsError = jest.spyOn(toastsStore, "toastsError");
      });

      it("should bubble error for query call", async () => {
        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: true,
          },
          universeId: params.universeId,
        });

        const call = () =>
          getCkBTCWithdrawalAccount({
            ...params,
            certified: false,
          });

        expect(call).rejects.toThrowError();

        await waitFor(() => expect(spyOnToastsError).toHaveBeenCalled());
      });
    });
  });
});
