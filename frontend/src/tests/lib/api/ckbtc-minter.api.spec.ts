import { getBTCAddress } from "$lib/api/ckbtc-minter.api";
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

  describe("getBTCAddress", () => {
    it("returns the bitcoin address", async () => {
      const getBTCAddressSpy =
        minterCanisterMock.getBtcAddress.mockResolvedValue(mockCkBTCAddress);

      const result = await getBTCAddress({ identity: mockIdentity });

      expect(result).toEqual(mockCkBTCAddress);

      expect(getBTCAddressSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      minterCanisterMock.getBtcAddress.mockImplementation(async () => {
        throw new Error();
      });

      const call = () => getBTCAddress({ identity: mockIdentity });

      expect(call).rejects.toThrowError();
    });
  });
});
