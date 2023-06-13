import {
  depositFee,
  estimateFee,
  getBTCAddress,
  getWithdrawalAccount,
  minterInfo,
  retrieveBtc,
  updateBalance,
} from "$lib/api/ckbtc-minter.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockBTCAddressTestnet } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockCkBTCMinterInfo,
  mockUpdateBalanceOk,
} from "$tests/mocks/ckbtc-minter.mock";
import { CkBTCMinterCanister, type RetrieveBtcOk } from "@dfinity/ckbtc";
import mock from "jest-mock-extended/lib/Mock";

describe("ckbtc-minter api", () => {
  const minterCanisterMock = mock<CkBTCMinterCanister>();

  beforeAll(() => {
    jest
      .spyOn(CkBTCMinterCanister, "create")
      .mockImplementation(() => minterCanisterMock);
  });

  afterAll(() => jest.clearAllMocks());

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

  describe("getWithdrawalAccount", () => {
    it("returns the bitcoin withdrawal account", async () => {
      const mockAccount = {
        owner: mockPrincipal,
        subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
      };

      const getWithdrawalAccountSpy =
        minterCanisterMock.getWithdrawalAccount.mockResolvedValue(mockAccount);

      const result = await getWithdrawalAccount(params);

      expect(result).toEqual(mockAccount);

      expect(getWithdrawalAccountSpy).toBeCalled();
    });

    it("throws an error if issue get withdrawal account", () => {
      minterCanisterMock.getWithdrawalAccount.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => getWithdrawalAccount(params);

      expect(call).rejects.toThrowError();
    });
  });

  describe("retrieveBtc", () => {
    const retrieveParams = {
      ...params,
      address: mockBTCAddressTestnet,
      amount: 123n,
    };

    it("returns successfully when btc are retrieved", async () => {
      const ok: RetrieveBtcOk = {
        block_index: 1n,
      };

      const retrieveBtcSpy =
        minterCanisterMock.retrieveBtc.mockResolvedValue(ok);

      const result = await retrieveBtc(retrieveParams);

      expect(result).toEqual(ok);

      expect(retrieveBtcSpy).toBeCalled();
    });

    it("bubble errors", () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => retrieveBtc(retrieveParams);

      expect(call).rejects.toThrowError();
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

  describe("depositFee", () => {
    it("returns deposit fee", async () => {
      const expectedResult = 789n;

      const depositFeeSpy =
        minterCanisterMock.getDepositFee.mockResolvedValue(expectedResult);

      const result = await depositFee(params);

      expect(result).toEqual(expectedResult);

      expect(depositFeeSpy).toBeCalled();
    });

    it("bubble errors", () => {
      minterCanisterMock.getDepositFee.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => depositFee(params);

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
