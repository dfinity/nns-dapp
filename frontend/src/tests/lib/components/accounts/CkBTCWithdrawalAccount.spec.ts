/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
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
  mockCkBTCToken,
  mockCkBTCWithdrawalAccount,
  mockCkBTCWithdrawalIcrcAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { TokenAmount } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

describe("CkBTCWithdrawalAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    jest.spyOn(console, "error").mockImplementation(() => undefined);

    ckBTCWithdrawalAccountsStore.reset();

    page.mock({
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe("loading error", () => {
    beforeEach(() => {
      jest.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
        owner: mockCkBTCWithdrawalIcrcAccount.owner,
        subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
      });

      jest
        .spyOn(minterServices, "getWithdrawalAccount")
        .mockRejectedValue(new Error());
    });

    it("should not render a button if no account", () => {
      const { getByTestId } = render(CkBTCWithdrawalAccount);

      expect(() => getByTestId("open-restart-convert-ckbtc-to-btc")).toThrow();
    });
  });

  describe("getCkBTCAccount returns a valid account", () => {
    let spyGetCkBTCAccount;

    beforeEach(() => {
      spyGetCkBTCAccount = jest
        .spyOn(ledgerApi, "getCkBTCAccount")
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
        jest.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
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
    const balanceZero = TokenAmount.fromString({
      amount: "0",
      token: mockCkBTCToken,
    }) as TokenAmount;

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
          value: mockCkBTCWithdrawalAccount.balance.toE8s(),
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
              balance: balanceZero,
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
        jest.spyOn(minterServices, "getWithdrawalAccount").mockResolvedValue({
          owner: mockCkBTCWithdrawalIcrcAccount.owner,
          subaccount: [mockCkBTCWithdrawalIcrcAccount.subaccount],
        });

        jest.spyOn(ledgerApi, "getCkBTCAccount").mockResolvedValue({
          ...mockCkBTCWithdrawalAccount,
          balance: balanceZero,
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
});
