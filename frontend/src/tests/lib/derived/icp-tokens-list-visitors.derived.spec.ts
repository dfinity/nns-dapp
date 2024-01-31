import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { icpTokensListVisitors } from "$lib/derived/icp-tokens-list-visitors.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { createIcpUserToken } from "$tests/mocks/tokens-page.mock";
import { get } from "svelte/store";

describe("icp-tokens-list-visitors.derived", () => {
  const expectedIcpTokenVisitor: UserTokenData = createIcpUserToken({
    actions: [UserTokenAction.GoToDetail],
    rowHref: `/wallet/?u=${OWN_CANISTER_ID_TEXT}`,
  });

  describe("icpTokensListVisitors", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    it("should return ICP with unavailable balance", () => {
      expect(get(icpTokensListVisitors)).toEqual([expectedIcpTokenVisitor]);
    });
  });
});
