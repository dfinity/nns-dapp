import * as agent from "$lib/api/agent.api";
import {
  estimateFee,
  getBTCAddress,
  minterInfo,
  retrieveBtcStatusV2ByAccount,
  retrieveBtcWithApproval,
  updateBalance,
} from "$lib/api/ckbtc-minter.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockBTCAddressTestnet } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockCkBTCMinterInfo,
  mockUpdateBalanceOk,
} from "$tests/mocks/ckbtc-minter.mock";
import type { HttpAgent } from "@dfinity/agent";
import {
  CkBTCMinterCanister,
  type RetrieveBtcOk,
  type RetrieveBtcStatusV2WithId,
} from "@dfinity/ckbtc";
import { mock } from "vitest-mock-extended";

describe("ckbtc-minter api", () => {
  const minterCanisterMock = mock<CkBTCMinterCanister>();

  beforeEach(() => {
    vi.spyOn(CkBTCMinterCanister, "create").mockImplementation(
      () => minterCanisterMock
    );
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  const params = {
    identity: mockIdentity,
    canisterId: CKBTC_MINTER_CANISTER_ID,
  };

  describe("getBTCAddress", () => {
    it("returns the bitcoin address", async () => {
      const getBTCAddressSpy =
        minterCanisterMock.getBtcAddress.mockResolvedValue(
          mockBTCAddressTestnet
        );

      const result = await getBTCAddress(params);

      expect(result).toEqual(mockBTCAddressTestnet);

      expect(getBTCAddressSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      minterCanisterMock.getBtcAddress.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => getBTCAddress(params);

      expect(call).rejects.toThrowError();
    });
  });

  describe("updateBalance", () => {
    it("returns successfully updated balance", async () => {
      const getBTCAddressSpy =
        minterCanisterMock.updateBalance.mockResolvedValue(mockUpdateBalanceOk);

      const result = await updateBalance(params);

      expect(result).toEqual(mockUpdateBalanceOk);

      expect(getBTCAddressSpy).toBeCalled();
    });

    it("bubble errors", () => {
      minterCanisterMock.updateBalance.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => updateBalance(params);

      expect(call).rejects.toThrowError();
    });
  });

  describe("retrieveBtcWithApproval", () => {
    const retrieveWithApprovalParams = {
      address: mockBTCAddressTestnet,
      amount: 123n,
    };

    it("returns successfully when btc are retrieved", async () => {
      const ok: RetrieveBtcOk = {
        block_index: 1n,
      };

      const retrieveBtcWithApprovalSpy =
        minterCanisterMock.retrieveBtcWithApproval.mockResolvedValue(ok);

      const result = await retrieveBtcWithApproval({
        ...params,
        ...retrieveWithApprovalParams,
      });

      expect(result).toEqual(ok);

      expect(retrieveBtcWithApprovalSpy).toBeCalledTimes(1);
      expect(retrieveBtcWithApprovalSpy).toBeCalledWith(
        retrieveWithApprovalParams
      );
    });

    it("bubble errors", () => {
      minterCanisterMock.retrieveBtcWithApproval.mockImplementation(
        async () => {
          throw new Error();
        }
      );

      const call = () =>
        retrieveBtcWithApproval({
          ...params,
          ...retrieveWithApprovalParams,
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("retrieveBtcStatusV2ByAccount", () => {
    it("returns result", async () => {
      const statuses: RetrieveBtcStatusV2WithId[] = [
        {
          id: 135n,
          status: {
            Confirmed: { txid: [1, 2, 3] },
          },
        },
      ];

      const spy =
        minterCanisterMock.retrieveBtcStatusV2ByAccount.mockResolvedValue(
          statuses
        );

      const statusesParams = {
        certified: true,
      };

      const result = await retrieveBtcStatusV2ByAccount({
        ...params,
        ...statusesParams,
      });

      expect(result).toEqual(statuses);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(statusesParams);
    });
  });

  describe("estimateFee", () => {
    const feeParams = {
      ...params,
      amount: 123n,
    };

    it("returns estimated fee", async () => {
      const expectedResult = { minter_fee: 123n, bitcoin_fee: 456n };

      const estimateFeeSpy =
        minterCanisterMock.estimateWithdrawalFee.mockResolvedValue(
          expectedResult
        );

      const result = await estimateFee(feeParams);

      expect(result).toEqual(expectedResult);

      expect(estimateFeeSpy).toBeCalled();
    });

    it("bubble errors", () => {
      minterCanisterMock.estimateWithdrawalFee.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => estimateFee(feeParams);

      expect(call).rejects.toThrowError();
    });
  });

  describe("minterInfo", () => {
    it("returns minter info", async () => {
      const minterFeeSpy =
        minterCanisterMock.getMinterInfo.mockResolvedValue(mockCkBTCMinterInfo);

      const result = await minterInfo(params);

      expect(result).toEqual(mockCkBTCMinterInfo);

      expect(minterFeeSpy).toBeCalled();
    });

    it("bubble errors", () => {
      minterCanisterMock.getMinterInfo.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => minterInfo(params);

      expect(call).rejects.toThrowError();
    });
  });
});
