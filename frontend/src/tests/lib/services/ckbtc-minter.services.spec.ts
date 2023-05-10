import * as minterApi from "$lib/api/ckbtc-minter.api";
import {
  CKBTC_MINTER_CANISTER_ID,
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as services from "$lib/services/ckbtc-minter.services";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import * as busyStore from "$lib/stores/busy.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { ApiErrorKey } from "$lib/types/api.errors";
import { page } from "$mocks/$app/stores";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockUpdateBalanceOk } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
  type WithdrawalAccount,
} from "@dfinity/ckbtc";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { vi } from "vitest";

describe("ckbtc-minter-services", () => {
  afterEach(() => vi.clearAllMocks());

  describe("loadBtcAddress", () => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });

    it("should get bitcoin address", async () => {
      const spyGetAddress = vi
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);

      const store = get(bitcoinAddressStore);
      expect(store[mockCkBTCMainAccount.identifier]).toBeUndefined();

      await services.loadBtcAddress({
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
        identifier: mockCkBTCMainAccount.identifier,
      });

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKTESTBTC_MINTER_CANISTER_ID,
        })
      );

      const storeAfter = get(bitcoinAddressStore);
      expect(storeAfter[mockCkBTCMainAccount.identifier]).toEqual(
        mockBTCAddressTestnet
      );
    });
  });

  describe("updateBalance", () => {
    beforeEach(() =>
      vi.spyOn(console, "error").mockImplementation(() => undefined)
    );

    const params = {
      minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      reload: undefined,
    };

    it("should update balance", async () => {
      const spyUpdateBalance = vi
        .spyOn(minterApi, "updateBalance")
        .mockResolvedValue(mockUpdateBalanceOk);

      const result = await services.updateBalance(params);

      await waitFor(() =>
        expect(spyUpdateBalance).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
        })
      );

      expect(result).toEqual({ success: true });
    });

    it("should reload after update balance", async () => {
      const spyReload = vi.fn();

      await services.updateBalance({ ...params, reload: spyReload });

      await waitFor(() => expect(spyReload).toBeCalled());
    });

    it("should start and stop busy", async () => {
      const startBusySpy = vi
        .spyOn(busyStore, "startBusy")
        .mockImplementation(vi.fn());

      const stopBusySpy = vi
        .spyOn(busyStore, "stopBusy")
        .mockImplementation(vi.fn());

      await services.updateBalance(params);

      expect(startBusySpy).toHaveBeenCalled();
      expect(stopBusySpy).toHaveBeenCalled();
    });

    it("should return generic error", async () => {
      const Err = {
        GenericError: {
          error_message: "message",
          error_code: 123n,
        },
      };

      const error = `${Err.GenericError.error_message} (${Err.GenericError.error_code})`;

      vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterGenericError(error);
      });

      const result = await services.updateBalance(params);

      expect(result).toEqual({
        success: false,
        err: new MinterGenericError(error),
      });
    });

    it("should return temporary unavailable error", async () => {
      const error = "message";

      vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterTemporaryUnavailableError(error);
      });

      const err = new ApiErrorKey(
        `${en.error__ckbtc.temporary_unavailable} (${error})`
      );

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: false, err });
    });

    it("should return already processing error", async () => {
      vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterAlreadyProcessingError();
      });

      const err = new ApiErrorKey(en.error__ckbtc.already_process);

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: false, err });
    });

    it("should handle no new UTXOs success", async () => {
      vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterNoNewUtxosError();
      });

      const spyOnToastsShow = vi.spyOn(toastsStore, "toastsShow");

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: true });
      expect(spyOnToastsShow).toHaveBeenCalledWith({
        level: "success",
        labelKey: en.error__ckbtc.no_new_confirmed_btc,
        duration: 4000,
        substitutions: undefined,
      });
    });
  });

  describe("estimateFee", () => {
    it("should call estimate fee", async () => {
      const result = { minter_fee: 123n, bitcoin_fee: 456n };

      const spyEstimateFee = vi
        .spyOn(minterApi, "estimateFee")
        .mockResolvedValue(result);

      const params = { certified: true, amount: 456n };

      const callback = vi.fn();

      await services.estimateFee({
        params,
        callback,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      await waitFor(() =>
        expect(spyEstimateFee).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
          ...params,
        })
      );

      expect(callback).toHaveBeenCalledWith(result);
      // Query + Update
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("depositFee", () => {
    it("should call deposit fee", async () => {
      const result = 789n;

      const spyDepositFee = vi
        .spyOn(minterApi, "depositFee")
        .mockResolvedValue(result);

      const params = { certified: true };

      const callback = vi.fn();

      await services.depositFee({
        callback,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      await waitFor(() =>
        expect(spyDepositFee).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
          ...params,
        })
      );

      expect(callback).toHaveBeenCalledWith(result);
      // Query + Update
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe("getWithdrawalAccount", () => {
    it("should call get withdrawal account", async () => {
      const result: WithdrawalAccount = {
        owner: mockCkBTCMainAccount.principal,
        subaccount: [],
      };

      const spyGetWithdrawal = vi
        .spyOn(minterApi, "getWithdrawalAccount")
        .mockResolvedValue(result);

      await services.getWithdrawalAccount({
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      await waitFor(() =>
        expect(spyGetWithdrawal).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
        })
      );
    });
  });
});
