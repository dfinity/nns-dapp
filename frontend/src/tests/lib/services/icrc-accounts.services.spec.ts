import { getIcrcAccountIdentity } from "$lib/services/icrc-accounts.services";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";

describe("icrc-accounts-services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  describe("getIcrcAccountIdentity", () => {
    it("returns identity", async () => {
      const identity = await getIcrcAccountIdentity(mockSnsMainAccount);
      expect(identity).toEqual(mockIdentity);
    });
  });
});
