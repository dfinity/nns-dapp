/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-minter.services";
import { ApiErrorKey } from "$lib/types/api.errors";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockBTCAddressTestnet } from "$tests/mocks/ckbtc-accounts.mock";
import { mockUpdateBalanceOk } from "$tests/mocks/ckbtc-minter.mock";
import en from "$tests/mocks/i18n.mock";
import {
  MinterAlreadyProcessingError,
  MinterGenericError,
  MinterNoNewUtxosError,
  MinterTemporaryUnavailableError,
} from "@dfinity/ckbtc";
import { waitFor } from "@testing-library/svelte";

describe("ckbtc-minter-services", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getBTCAddress", () => {
    it("should get bitcoin address", async () => {
      const spyGetAddress = jest
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockBTCAddressTestnet);

      await services.getBTCAddress(CKBTC_MINTER_CANISTER_ID);

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
        })
      );
    });
  });

  describe("updateBalance", () => {
    it("should update balance", async () => {
      const spyUpdateBalance = jest
        .spyOn(minterApi, "updateBalance")
        .mockResolvedValue(mockUpdateBalanceOk);

      const result = await services.updateBalance(CKBTC_MINTER_CANISTER_ID);

      await waitFor(() =>
        expect(spyUpdateBalance).toBeCalledWith({
          identity: mockIdentity,
          canisterId: CKBTC_MINTER_CANISTER_ID,
        })
      );

      expect(result).toEqual(mockUpdateBalanceOk);
    });

    it("should throw generic error", async () => {
      const Err = {
        GenericError: {
          error_message: "message",
          error_code: 123n,
        },
      };

      const error = `${Err.GenericError.error_message} (${Err.GenericError.error_code})`;

      jest.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterGenericError(error);
      });

      const call = () => services.updateBalance(CKBTC_MINTER_CANISTER_ID);

      await expect(call).rejects.toThrowError(new ApiErrorKey(error));
    });

    it("should throw temporary unavailable error", async () => {
      const error = "message";

      jest.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterTemporaryUnavailableError(error);
      });

      const call = () => services.updateBalance(CKBTC_MINTER_CANISTER_ID);

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(`${en.error__ckbtc.temporary_unavailable} (${error})`)
      );
    });

    it("should throw already processing error", async () => {
      jest.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterAlreadyProcessingError();
      });

      const call = () => services.updateBalance(CKBTC_MINTER_CANISTER_ID);

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(en.error__ckbtc.already_process)
      );
    });

    it("should throw no new UTXOs error", async () => {
      jest.spyOn(minterApi, "updateBalance").mockImplementation(async () => {
        throw new MinterNoNewUtxosError();
      });

      const call = () => services.updateBalance(CKBTC_MINTER_CANISTER_ID);

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(en.error__ckbtc.no_new_utxo)
      );
    });
  });

  describe("estimateFee", () => {
    it("should call estimate fee", async () => {
      const result = { minter_fee: 123n, bitcoin_fee: 456n };

      const spyEstimateFee = jest
        .spyOn(minterApi, "estimateFee")
        .mockResolvedValue(result);

      const params = { certified: true, amount: 456n };

      const callback = jest.fn();

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
});
