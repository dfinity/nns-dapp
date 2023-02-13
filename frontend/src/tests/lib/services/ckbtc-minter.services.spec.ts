/**
 * @jest-environment jsdom
 */

import * as minterApi from "$lib/api/ckbtc-minter.api";
import * as services from "$lib/services/ckbtc-minter.services";
import { ApiErrorKey } from "$lib/types/api.errors";
import type { UpdateBalanceError } from "@dfinity/ckbtc";
import { waitFor } from "@testing-library/svelte";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCkBTCAddress } from "../../mocks/ckbtc-accounts.mock";
import en from "../../mocks/i18n.mock";

describe("ckbtc-minter-services", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getBTCAddress", () => {
    it("should get bitcoin address", async () => {
      const spyGetAddress = jest
        .spyOn(minterApi, "getBTCAddress")
        .mockResolvedValue(mockCkBTCAddress);

      await services.getBTCAddress();

      await waitFor(() =>
        expect(spyGetAddress).toBeCalledWith({
          identity: mockIdentity,
        })
      );
    });
  });

  describe("updateBalance", () => {
    it("should update balance", async () => {
      const ok = {
        Ok: {
          block_index: 1n,
          amount: 100_000n,
        },
      };

      const spyUpdateBalance = jest
        .spyOn(minterApi, "updateBalance")
        .mockResolvedValue(ok);

      const result = await services.updateBalance();

      await waitFor(() =>
        expect(spyUpdateBalance).toBeCalledWith({
          identity: mockIdentity,
        })
      );

      expect(result).toEqual(ok.Ok);
    });

    it("should throw generic error", async () => {
      const Err = {
        GenericError: {
          error_message: "message",
          error_code: 123n,
        },
      };

      const error: { Err: UpdateBalanceError } = { Err };

      jest.spyOn(minterApi, "updateBalance").mockResolvedValue(error);

      const call = () => services.updateBalance();

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(
          `${Err.GenericError.error_message} (${Err.GenericError.error_code})`
        )
      );
    });

    it("should throw temporary unavailable error", async () => {
      const Err = {
        TemporarilyUnavailable: "message",
      };

      const error: { Err: UpdateBalanceError } = { Err };

      jest.spyOn(minterApi, "updateBalance").mockResolvedValue(error);

      const call = () => services.updateBalance();

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(
          `${en.error__ckbtc.temporary_unavailable} (${Err.TemporarilyUnavailable})`
        )
      );
    });

    it("should throw already processing error", async () => {
      const Err = {
        AlreadyProcessing: null,
      };

      const error: { Err: UpdateBalanceError } = { Err };

      jest.spyOn(minterApi, "updateBalance").mockResolvedValue(error);

      const call = () => services.updateBalance();

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(en.error__ckbtc.already_process)
      );
    });

    it("should throw no new UTXOs error", async () => {
      const Err = {
        NoNewUtxos: null,
      };

      const error: { Err: UpdateBalanceError } = { Err };

      jest.spyOn(minterApi, "updateBalance").mockResolvedValue(error);

      const call = () => services.updateBalance();

      await expect(call).rejects.toThrowError(
        new ApiErrorKey(en.error__ckbtc.no_new_utxo)
      );
    });
  });
});
