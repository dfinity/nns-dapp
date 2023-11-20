import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { icpTokensListVisitors } from "$lib/derived/icp-tokens-list-visitors.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import { get } from "svelte/store";

describe("icp-tokens-list-visitors.derived", () => {
  const icpTokenBase: UserTokenData = {
    universeId: OWN_CANISTER_ID,
    title: "Internet Computer",
    logo: IC_LOGO_ROUNDED,
    balance: new UnavailableTokenAmount(NNS_TOKEN_DATA),
    actions: [UserTokenAction.GoToDetail],
  };

  describe("icpTokensListVisitors", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    it("should return ICP with unavailable balance", () => {
      expect(get(icpTokensListVisitors)).toEqual([icpTokenBase]);
    });
  });
});
