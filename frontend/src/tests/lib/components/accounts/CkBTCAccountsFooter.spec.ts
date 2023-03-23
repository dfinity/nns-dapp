/**
 * @jest-environment jsdom
 */

import CkBTCAccountsFooter from "$lib/components/accounts/CkBTCAccountsFooter.svelte";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as services from "$lib/services/ckbtc-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { selectSegmentBTC } from "$tests/utils/accounts.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { page } from "../../../../../__mocks__/$app/stores";
import CkBTCAccountsTest from "./CkBTCAccountsTest.svelte";

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    getBTCAddress: jest.fn().mockImplementation(() => mockBTCAddressTestnet),
    updateBalance: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("CkBTCAccountsFooter", () => {
  beforeAll(() => {
    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();

    icrcAccountsStore.reset();
    tokensStore.reset();
  });

  describe("not loaded", () => {
    it("should not render action if data not loaded", () => {
      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(() => expect(getByTestId("open-ckbtc-transaction"))).toThrow();
    });

    it("should not render action if only accounts loaded", () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(() => expect(getByTestId("open-ckbtc-transaction"))).toThrow();
    });

    it("should not render action if only token loaded", () => {
      tokensStore.setTokens(mockTokens);

      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(() => expect(getByTestId("open-ckbtc-transaction"))).toThrow();
    });
  });

  describe("loaded", () => {
    beforeEach(() => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      tokensStore.setTokens(mockTokens);
    });

    it("should render action if all required data loaded", () => {
      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(getByTestId("open-ckbtc-transaction")).not.toBeNull();
    });

    it("should open send modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsTest, {
        props: { testComponent: CkBTCAccountsFooter },
      });

      fireEvent.click(
        getByTestId("open-ckbtc-transaction") as HTMLButtonElement
      );

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });

    it("should open receive modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsTest, {
        props: { testComponent: CkBTCAccountsFooter },
      });

      fireEvent.click(getByTestId("receive-ckbtc") as HTMLButtonElement);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });

    it("should reload on close receive modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsTest, {
        props: { testComponent: CkBTCAccountsFooter },
      });

      fireEvent.click(getByTestId("receive-ckbtc") as HTMLButtonElement);

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );

      await selectSegmentBTC(container);

      const spy = jest.spyOn(services, "syncCkBTCAccounts");

      fireEvent.click(getByTestId("update-ckbtc-balance") as HTMLButtonElement);

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });
});
