import CkBTCAccountsFooter from "$lib/components/accounts/CkBTCAccountsFooter.svelte";
import {
  CKTESTBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as services from "$lib/services/wallet-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { selectSegmentBTC } from "$tests/utils/accounts.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import CkBTCAccountsTest from "./CkBTCAccountsTest.svelte";

vi.mock("$lib/api/ckbtc-minter.api", () => {
  return {
    updateBalance: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-minter.services", async () => {
  return {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ...(await vi.importActual<any>("$lib/services/ckbtc-minter.services")),
    loadBtcAddress: vi.fn().mockImplementation(() => undefined),
  };
});

vi.mock("$lib/services/wallet-uncertified-accounts.services", () => {
  return {
    syncAccounts: vi.fn().mockResolvedValue(undefined),
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
    vi.clearAllMocks();

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
        ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID,
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
        ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID,
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

      const spy = vi.spyOn(services, "syncAccounts");

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });
});
