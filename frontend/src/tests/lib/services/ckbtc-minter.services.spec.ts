import * as minterApi from "$lib/api/ckbtc-minter.api";
import {
  CKBTC_MINTER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as services from "$lib/services/ckbtc-minter.services";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import * as busyStore from "$lib/stores/busy.store";
import { ckbtcPendingUtxosStore } from "$lib/stores/ckbtc-pending-utxos.store";
import { ckbtcRetrieveBtcStatusesStore } from "$lib/stores/ckbtc-retrieve-btc-statuses.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { ApiErrorKey } from "$lib/types/api.errors";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockUpdateBalanceOk } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import type { RetrieveBtcStatusV2WithId } from "@dfinity/ckbtc";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
  type WithdrawalAccount,
} from "@dfinity/ckbtc";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ckbtc-minter-services", () => {
  beforeEach(() => {
    resetIdentity();
    ckbtcRetrieveBtcStatusesStore.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    const params = {
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
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

    it("should reload after update balance even if update balance is on error", async () => {
      vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterAlreadyProcessingError();
      });

      const spyReload = vi.fn();

      const err = new ApiErrorKey(en.error__ckbtc.already_process);

      const result = await services.updateBalance({
        ...params,
        reload: spyReload,
      });

      await waitFor(() => expect(spyReload).toBeCalled());
      expect(result).toEqual({ success: false, err });
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
        throw new MinterNoNewUtxosError({
          required_confirmations: 12,
          pending_utxos: [],
        });
      });

      const spyOnToastsSuccess = vi.spyOn(toastsStore, "toastsSuccess");

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: true });
      expect(spyOnToastsSuccess).toHaveBeenCalledWith({
        labelKey: "error__ckbtc.no_new_confirmed_btc",
      });

      expect(get(ckbtcPendingUtxosStore)).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: [],
      });
    });

    it("should add pending UTXO to store", async () => {
      const pendingUtxo = {
        outpoint: { txid: new Uint8Array([3, 5, 7]), vout: 0 },
        value: 760_000n,
        confirmations: 10,
      };
      vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterNoNewUtxosError({
          required_confirmations: 12,
          pending_utxos: [[pendingUtxo]],
        });
      });

      const spyOnToastsSuccess = vi.spyOn(toastsStore, "toastsSuccess");

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: true });

      expect(spyOnToastsSuccess).toBeCalledTimes(1);
      expect(spyOnToastsSuccess).toBeCalledWith({
        labelKey: "error__ckbtc.no_new_confirmed_btc",
      });

      expect(get(ckbtcPendingUtxosStore)).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: [pendingUtxo],
      });
    });

    it("should fetch pending UTXOs after success", async () => {
      const pendingUtxo = {
        outpoint: { txid: new Uint8Array([3, 5, 7]), vout: 0 },
        value: 760_000n,
        confirmations: 10,
      };
      vi.spyOn(minterApi, "updateBalance")
        .mockResolvedValueOnce(mockUpdateBalanceOk)
        .mockImplementation(async () => {
          throw new MinterNoNewUtxosError({
            required_confirmations: 12,
            pending_utxos: [[pendingUtxo]],
          });
        });

      const spyOnToastsSuccess = vi.spyOn(toastsStore, "toastsSuccess");

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: true });
      expect(spyOnToastsSuccess).toBeCalledTimes(1);
      expect(spyOnToastsSuccess).toBeCalledWith({
        labelKey: "ckbtc.ckbtc_balance_updated",
      });

      expect(get(ckbtcPendingUtxosStore)).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: [pendingUtxo],
      });
    });

    it("should stop after 3 times success", async () => {
      const updateBalanceSpy = vi
        .spyOn(minterApi, "updateBalance")
        .mockResolvedValue(mockUpdateBalanceOk);

      const spyOnToastsSuccess = vi.spyOn(toastsStore, "toastsSuccess");

      const result = await services.updateBalance(params);

      expect(result).toEqual({ success: true });
      expect(updateBalanceSpy).toBeCalledTimes(3);

      expect(spyOnToastsSuccess).toBeCalledTimes(1);
      expect(spyOnToastsSuccess).toBeCalledWith({
        labelKey: "ckbtc.ckbtc_balance_updated",
      });
    });

    it("should return generic error even if no ui indicators", async () => {
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

      const result = await services.updateBalance({
        ...params,
        uiIndicators: false,
      });

      expect(result).toEqual({
        success: false,
        err: new MinterGenericError(error),
      });
    });

    describe("no ui indicators", () => {
      it("should not start and stop busy", async () => {
        const startBusySpy = vi
          .spyOn(busyStore, "startBusy")
          .mockImplementation(vi.fn());

        const stopBusySpy = vi
          .spyOn(busyStore, "stopBusy")
          .mockImplementation(vi.fn());

        await services.updateBalance({
          ...params,
          uiIndicators: false,
        });

        expect(startBusySpy).not.toHaveBeenCalled();
        expect(stopBusySpy).not.toHaveBeenCalled();
      });

      it("should not toast success if no ui indicators", async () => {
        const spyUpdateBalance = vi
          .spyOn(minterApi, "updateBalance")
          .mockResolvedValue(mockUpdateBalanceOk);

        const spyOnToastsShow = vi.spyOn(toastsStore, "toastsShow");

        await services.updateBalance({
          ...params,
          uiIndicators: false,
        });

        await waitFor(() =>
          expect(spyUpdateBalance).toBeCalledWith({
            identity: mockIdentity,
            canisterId: CKBTC_MINTER_CANISTER_ID,
          })
        );

        expect(spyOnToastsShow).not.toHaveBeenCalled();
      });

      it("should not toast error on error if no ui indicators", async () => {
        const spyUpdateBalance = vi
          .spyOn(minterApi, "updateBalance")
          .mockImplementation(async () => {
            throw new MinterAlreadyProcessingError();
          });

        const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

        await services.updateBalance({
          ...params,
          uiIndicators: false,
        });

        await waitFor(() =>
          expect(spyUpdateBalance).toBeCalledWith({
            identity: mockIdentity,
            canisterId: CKBTC_MINTER_CANISTER_ID,
          })
        );

        expect(spyOnToastsError).not.toHaveBeenCalled();
      });

      it("should not handle no new UTXOs success if no ui indicators", async () => {
        vi.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
          throw new MinterNoNewUtxosError({
            required_confirmations: 12,
            pending_utxos: [],
          });
        });

        const spyOnToastsShow = vi.spyOn(toastsStore, "toastsShow");

        const result = await services.updateBalance({
          ...params,
          uiIndicators: false,
        });

        expect(result).toEqual({ success: true });
        expect(spyOnToastsShow).not.toHaveBeenCalled();
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

  describe("loadRetrieveBtcStatuses", () => {
    it("should call retrieveBtcStatusV2ByAccount and fill the store", async () => {
      const statuses: RetrieveBtcStatusV2WithId[] = [
        {
          id: 673n,
          status: {
            Pending: null,
          },
        },
        {
          id: 677n,
          status: {
            Confirmed: { txid: new Uint8Array([7, 6, 7, 8]) },
          },
        },
      ];
      const spy = vi
        .spyOn(minterApi, "retrieveBtcStatusV2ByAccount")
        .mockResolvedValue(statuses);

      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({});

      await services.loadRetrieveBtcStatuses({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKBTC_MINTER_CANISTER_ID,
      });

      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({
        [CKBTC_UNIVERSE_CANISTER_ID.toText()]: statuses,
      });

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKBTC_MINTER_CANISTER_ID,
        certified: false,
      });
    });

    it("should work with a different universe", async () => {
      const statuses: RetrieveBtcStatusV2WithId[] = [
        {
          id: 674n,
          status: {
            Pending: null,
          },
        },
        {
          id: 678n,
          status: {
            Confirmed: { txid: new Uint8Array([5, 6, 7, 8]) },
          },
        },
      ];
      const spy = vi
        .spyOn(minterApi, "retrieveBtcStatusV2ByAccount")
        .mockResolvedValue(statuses);

      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({});

      await services.loadRetrieveBtcStatuses({
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        minterCanisterId: CKTESTBTC_MINTER_CANISTER_ID,
      });

      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: statuses,
      });

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({
        identity: mockIdentity,
        canisterId: CKTESTBTC_MINTER_CANISTER_ID,
        certified: false,
      });
    });
  });
});
