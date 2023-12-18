import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import WalletLayout from "$routes/(app)/(u)/(detail)/wallet/+layout.svelte";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Wallet layout", () => {
  describe("when tokens flag is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
    });

    it("back button should navigate to tokens page if universe is not NNS", async () => {
      page.mock({
        routeId: AppPath.Wallet,
        data: {
          universe: rootCanisterIdMock.toText(),
          account: mockSnsMainAccount.identifier,
        },
      });
      const { queryByTestId } = render(WalletLayout);

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore).path).toEqual(AppPath.Tokens);
    });

    it("back button should navigate to Accounts page if universe is NNS", async () => {
      page.mock({
        routeId: AppPath.Wallet,
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          account: mockMainAccount.identifier,
        },
      });
      const { queryByTestId } = render(WalletLayout);

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: OWN_CANISTER_ID_TEXT,
      });
    });
  });

  describe("when tokens flag is disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
    });

    it("back button should navigate to Accounts page if universe is not NNS", async () => {
      page.mock({
        routeId: AppPath.Wallet,
        data: {
          universe: rootCanisterIdMock.toText(),
          account: mockSnsMainAccount.identifier,
        },
      });
      const { queryByTestId } = render(WalletLayout);

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: rootCanisterIdMock.toText(),
      });
    });

    it("back button should navigate to Accounts page if universe is NNS", async () => {
      page.mock({
        routeId: AppPath.Wallet,
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          account: mockMainAccount.identifier,
        },
      });
      const { queryByTestId } = render(WalletLayout);

      expect(get(pageStore).path).toEqual(AppPath.Wallet);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: OWN_CANISTER_ID_TEXT,
      });
    });
  });
});
