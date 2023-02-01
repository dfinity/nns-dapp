import { getIcrcMainAccount } from "$lib/api/icrc-ledger.api";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockQueryTokenResponse } from "../../mocks/sns-projects.mock";

describe("icrc-ledger api", () => {
  describe("getIcrcMainAccount", () => {
    const balanceSpy = jest.fn().mockResolvedValue(BigInt(10_000_000));

    it("returns main account with balance and project token metadata", async () => {
      const metadataSpy = jest.fn().mockResolvedValue(mockQueryTokenResponse);

      const account = await getIcrcMainAccount({
        certified: true,
        identity: mockIdentity,
        balance: balanceSpy,
        metadata: metadataSpy,
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
          balance: balanceSpy,
          metadata: metadataSpy,
        });

      expect(call).rejects.toThrowError();
    });
  });
});
