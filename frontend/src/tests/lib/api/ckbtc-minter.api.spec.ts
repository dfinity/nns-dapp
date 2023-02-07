import { getBTCAddress } from "$lib/api/ckbtc-minter.api";
import { CkBTCMinterCanister } from "@dfinity/ckbtc";
import mock from "jest-mock-extended/lib/Mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

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
      const address = "a_test_address";

      const getBTCAddressSpy =
        minterCanisterMock.getBtcAddress.mockResolvedValue(address);

      const result = await getBTCAddress({ identity: mockIdentity });

      expect(result).toEqual(address);

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
