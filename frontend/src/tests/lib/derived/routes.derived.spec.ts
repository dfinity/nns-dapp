import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath, UNIVERSE_PARAM } from "$lib/constants/routes.constants";
import {
  accountsPageOrigin,
  neuronsPageOrigin,
  walletPageOrigin,
} from "$lib/derived/routes.derived";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { get } from "svelte/store";

describe("routes.derived", () => {
  describe("accountsPageOrigin.derived", () => {
    it("should return Tokens page as default when history is empty", () => {
      expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
    });

    it("should return Tokens as default when no main pages were visited", () => {
      referrerPathStore.pushPath(AppPath.Staking);
      referrerPathStore.pushPath(AppPath.Settings);

      expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
    });

    it("should return Portfolio when it was the last main page visited", () => {
      referrerPathStore.pushPath(AppPath.Tokens);
      referrerPathStore.pushPath(AppPath.Portfolio);

      expect(get(accountsPageOrigin)).toBe(AppPath.Portfolio);
    });

    it("should return Tokens when it was the last main page visited", () => {
      referrerPathStore.pushPath(AppPath.Portfolio);
      referrerPathStore.pushPath(AppPath.Tokens);

      expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
    });

    it("should return Tokens when pages visited are more than the 3 slots", () => {
      referrerPathStore.pushPath(AppPath.Portfolio);
      referrerPathStore.pushPath(AppPath.Settings);
      referrerPathStore.pushPath(AppPath.Launchpad);
      referrerPathStore.pushPath(AppPath.Wallet);

      expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
    });
  });

  describe("walletPageOrigin.derived", () => {
    it("should return Portfolio when it was the last main page visited", () => {
      referrerPathStore.pushPath(AppPath.Portfolio);

      expect(get(walletPageOrigin)).toBe(AppPath.Portfolio);
    });

    it("should return ICP account when last page is not Portfolio and in NNS universe", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      referrerPathStore.pushPath(AppPath.Wallet);

      // TODO(yhabib): Extract icp account path to test-variable and use through codebase
      expect(get(walletPageOrigin)).toBe(
        `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should return Tokens when not in NNS universe and last page was not Portfolio", () => {
      page.mock({
        data: {
          universe: rootCanisterIdMock.toText(),
        },
      });
      referrerPathStore.pushPath(AppPath.Wallet);

      expect(get(walletPageOrigin)).toBe(AppPath.Tokens);
    });
  });

  describe("neuronsPageOrigin.derived", () => {
    it("should return Portfolio when it was the last page visited", () => {
      referrerPathStore.pushPath(AppPath.Portfolio);

      expect(get(neuronsPageOrigin)).toBe(AppPath.Portfolio);
    });

    it("should return to Staking page when it was the last page visited", () => {
      referrerPathStore.pushPath(AppPath.Staking);

      expect(get(neuronsPageOrigin)).toBe(AppPath.Staking);
    });

    it("should return to Staking page as defaultf", () => {
      referrerPathStore.pushPath(AppPath.Portfolio);
      referrerPathStore.pushPath(AppPath.Settings);

      expect(get(neuronsPageOrigin)).toBe(AppPath.Staking);
    });
  });
});
