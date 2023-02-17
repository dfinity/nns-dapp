import { getBTCAddress, updateBalance } from "$lib/api/ckbtc-minter.api";
import { CkBTCMinterCanister } from "@dfinity/ckbtc";
import mock from "jest-mock-extended/lib/Mock";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCkBTCAddress } from "../../mocks/ckbtc-accounts.mock";

describe("ckbtc-minter api", () => {
  const minterCanisterMock = mock<CkBTCMinterCanister>();

  beforeAll(() => {
    jest
      .spyOn(CkBTCMinterCanister, "create")
      .mockImplementation(() => minterCanisterMock);
  });

  afterAll(() => jest.clearAllMocks());

  const params = { identity: mockIdentity };

  describe("getBTCAddress", () => {
    it("returns the bitcoin address", async () => {
      const getBTCAddressSpy =
        minterCanisterMock.getBtcAddress.mockResolvedValue(mockCkBTCAddress);

      const result = await getBTCAddress(params);

      expect(result).toEqual(mockCkBTCAddress);

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
      const ok = {
        block_index: 1n,
        amount: 100_000n,
      };

      const getBTCAddressSpy =
        minterCanisterMock.updateBalance.mockResolvedValue(ok);

      const result = await updateBalance(params);

      expect(result).toEqual(ok);

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
});
