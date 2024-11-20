import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { icpTokensListVisitors } from "$lib/derived/icp-tokens-list-visitors.derived";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { createIcpUserToken } from "$tests/mocks/tokens-page.mock";
import { get } from "svelte/store";

describe("icp-tokens-list-visitors.derived", () => {
  const href = `/wallet/?u=${OWN_CANISTER_ID_TEXT}`;
  const expectedIcpTokenVisitor: UserTokenData = createIcpUserToken({
    actions: [UserTokenAction.GoToDetail],
    rowHref: href,
    domKey: href,
  });

  describe("icpTokensListVisitors", () => {
    it("should return ICP with unavailable balance", () => {
      expect(get(icpTokensListVisitors)).toEqual([expectedIcpTokenVisitor]);
    });
  });
});
