import { getIcrcAccountIdentity } from "$lib/services/icrc-accounts.services";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";

describe("icrc-accounts-services", () => {
  describe("getIcrcAccountIdentity", () => {
    it("returns identity", async () => {
      const identity = await getIcrcAccountIdentity(mockSnsMainAccount);
      expect(identity).toEqual(mockIdentity);
    });
  });
});
