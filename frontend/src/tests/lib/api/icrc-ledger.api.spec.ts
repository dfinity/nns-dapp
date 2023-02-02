import { getIcrcMainAccount, getIcrcToken } from "$lib/api/icrc-ledger.api";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "../../mocks/sns-projects.mock";

describe("icrc-ledger api", () => {
  describe("getIcrcMainAccount", () => {
    const balanceSpy = jest.fn().mockResolvedValue(BigInt(10_000_000));

    it("returns main account with balance and project token metadata", async () => {
      const metadataSpy = jest.fn().mockResolvedValue(mockQueryTokenResponse);

      const account = await getIcrcMainAccount({
        certified: true,
        identity: mockIdentity,
        getBalance: balanceSpy,
        getMetadata: metadataSpy,
      });

      expect(account).not.toBeUndefined();

      expect(account.balance.toE8s()).toEqual(BigInt(10_000_000));

      expect(balanceSpy).toBeCalled();
      expect(metadataSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      const metadataSpy = async () => {
        throw new Error();
      };

      const call = () =>
        getIcrcMainAccount({
          certified: true,
          identity: mockIdentity,
          getBalance: balanceSpy,
          getMetadata: metadataSpy,
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("getIcrcToken", () => {
    it("returns token metadata", async () => {
      const metadataSpy = jest.fn().mockResolvedValue(mockQueryTokenResponse);

      const token = await getIcrcToken({
        certified: true,
        getMetadata: metadataSpy,
      });

      expect(token).toEqual(mockSnsToken);

      expect(metadataSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      const metadataSpy = async () => {
        throw new Error();
      };

      const call = () =>
        getIcrcToken({
          certified: true,
          getMetadata: metadataSpy,
        });

      expect(call).rejects.toThrowError();
    });
  });
});
