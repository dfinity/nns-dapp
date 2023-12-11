import * as minterApi from "$lib/api/ckbtc-minter.api";
import * as ledgerApi from "$lib/api/wallet-ledger.api";
import CkBTCWithdrawalAccount from "$lib/components/accounts/CkBTCWithdrawalAccount.svelte";
import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as minterServices from "$lib/services/ckbtc-minter.services";
import { authStore } from "$lib/stores/auth.store";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import CkBTCAccountsTest from "$tests/lib/components/accounts/CkBTCAccountsTest.svelte";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIcrcAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

describe("CkBTCWithdrawalAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => undefined);

    ckBTCWithdrawalAccountsStore.reset();

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  describe("loading error", () => {
    beforeEach(() => {
      vi.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
        owner: mockCkBTCWithdrawalIcrcAccount.owner,
        subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
      });

      vi.spyOn(minterServices, "getWithdrawalAccount").mockRejectedValue(
        new Error()
      );
    });

    it("should not render a button if no account", () => {
      const { getByTestId } = render(CkBTCWithdrawalAccount);

      expect(() => getByTestId("open-restart-convert-ckbtc-to-btc")).toThrow();
    });
  });

  describe("getCkBTCAccount returns a valid account", () => {
    let spyGetCkBTCAccount;

    beforeEach(() => {
      spyGetCkBTCAccount = vi
        .spyOn(ledgerApi, "getAccount")
        .mockResolvedValue(mockCkBTCWithdrawalAccount);
    });

    describe("account is already loaded", () => {
      beforeEach(() => {
        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: true,
          },
          universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        });
      });

      it("should render a button if a matching account is loaded", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")
          ).toBeInTheDocument()
        );
      });

      it("should not get account if a matching account is already loaded", async () => {
        render(CkBTCWithdrawalAccount);

        await waitFor(() => expect(spyGetCkBTCAccount).not.toHaveBeenCalled());
      });
    });

    describe("account is not yet loaded", () => {
      beforeEach(() => {
        vi.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
          owner: mockCkBTCWithdrawalIcrcAccount.owner,
          subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
        });
      });

      it("should render a button if when account is loaded", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")
          ).toBeInTheDocument()
        );
      });

      it("should render the button disabled", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")?.getAttribute(
              "disabled"
            )
          ).not.toBeNull()
        );
      });

      it("should get account", async () => {
        render(CkBTCWithdrawalAccount);

        await waitFor(() => expect(spyGetCkBTCAccount).toHaveBeenCalled());
      });
    });
  });

  describe("messages", () => {
    const balanceZero = 0n;

    describe("with balance", () => {
      beforeEach(() => {
        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: true,
          },
          universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        });
      });

      it("should render a call to action if balance is bigger than zero", async () => {
        const { getByText } = render(CkBTCWithdrawalAccount);

        const balance = formatToken({
          value: mockCkBTCWithdrawalAccount.balanceUlps,
          detailed: true,
        });

        const label = replacePlaceholders(
          en.ckbtc.click_to_complete_btc_transfers,
          {
            $amount: balance,
          }
        );

        await waitFor(() => expect(getByText(label)).toBeInTheDocument());
      });

      it("should render the button disabled", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")?.getAttribute(
              "disabled"
            )
          ).toBeNull()
        );
      });
    });

    describe("with zero balance on load", () => {
      beforeEach(() => {
        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: {
              ...mockCkBTCWithdrawalAccount,
              balanceUlps: balanceZero,
            },
            certified: true,
          },
          universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        });
      });

      it("should not render a call to action if balance is zero", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        expect(() =>
          getByTestId("open-restart-convert-ckbtc-to-btc")
        ).toThrow();
      });
    });

    describe("with zero balance after load", () => {
      beforeEach(() => {
        vi.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
          owner: mockCkBTCWithdrawalIcrcAccount.owner,
          subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
        });

        vi.spyOn(ledgerApi, "getAccount").mockResolvedValue({
          ...mockCkBTCWithdrawalAccount,
          balanceUlps: balanceZero,
        });
      });

      it("should render a message that nothing should be completed", async () => {
        const { getByText } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByText(en.ckbtc.all_btc_transfers_complete)
          ).toBeInTheDocument()
        );
      });

      it("should keep the button disabled", async () => {
        const { getByTestId } = render(CkBTCWithdrawalAccount);

        await waitFor(() =>
          expect(
            getByTestId("open-restart-convert-ckbtc-to-btc")?.getAttribute(
              "disabled"
            )
          ).not.toBeNull()
        );
      });
    });
  });

  describe("action", () => {
    beforeEach(() => {
      ckBTCWithdrawalAccountsStore.reset();
      icrcAccountsStore.reset();
      tokensStore.reset();

      ckBTCWithdrawalAccountsStore.set({
        account: {
          account: mockCkBTCWithdrawalAccount,
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      tokensStore.setTokens(mockTokens);
    });

    it("should open send modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsTest, {
        props: { testComponent: CkBTCWithdrawalAccount },
      });

      await waitFor(() =>
        expect(
          getByTestId("open-restart-convert-ckbtc-to-btc")?.getAttribute(
            "disabled"
          )
        ).toBeNull()
      );

      fireEvent.click(
        getByTestId("open-restart-convert-ckbtc-to-btc") as HTMLButtonElement
      );

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });
  });

  describe("updateBalance", () => {
    let spyUpdateBalance;

    beforeEach(() => {
      vi.spyOn(ledgerApi, "getAccount").mockResolvedValue(
        mockCkBTCWithdrawalAccount
      );

      spyUpdateBalance = vi
        .spyOn(minterApi, "updateBalance")
        .mockResolvedValue(undefined);
    });

    describe("account is already loaded", () => {
      beforeEach(() => {
        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: true,
          },
          universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
        });
      });

      it("should not call update balance if account is already loaded", async () => {
        render(CkBTCWithdrawalAccount);

        await waitFor(() => expect(spyUpdateBalance).not.toHaveBeenCalled());
      });
    });

    describe("account is not yet loaded", () => {
      beforeEach(() => {
        vi.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
          owner: mockCkBTCWithdrawalIcrcAccount.owner,
          subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
        });
      });

      it("should call update balance", async () => {
        render(CkBTCWithdrawalAccount);

        await waitFor(() => expect(spyUpdateBalance).toHaveBeenCalledTimes(1));
      });
    });
  });
});
