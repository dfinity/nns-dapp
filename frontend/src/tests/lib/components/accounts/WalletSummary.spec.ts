/**
 * @jest-environment jsdom
 */

import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
import { dispatchIntersecting } from "$lib/directives/intersection.directives";
import { layoutTitleStore } from "$lib/stores/layout.store";
import {
  WALLET_CONTEXT_KEY,
  type WalletContext,
  type WalletStore,
} from "$lib/types/wallet.context";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { ICPToken } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { get, writable } from "svelte/store";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("WalletSummary", () => {
  const renderWalletSummary = (detailedBalance?: boolean) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: WALLET_CONTEXT_KEY,
        contextValue: {
          store: writable<WalletStore>({
            account: mockMainAccount,
            neurons: [],
          }),
        } as WalletContext,
        Component: WalletSummary,
        props: {
          detailedBalance,
        },
      },
    });

  it("should render title", () => {
    const { getByText } = renderWalletSummary();

    expect(getByText(en.accounts.main)).toBeInTheDocument();
  });

  it("should render an account identifier", () => {
    const { getByText } = renderWalletSummary();

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a shortened balance in ICP", () => {
    const { getByText, queryByTestId } = renderWalletSummary();

    const icp: HTMLSpanElement | null = queryByTestId("token-value");

    expect(icp?.innerHTML).toEqual(
      `${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
    expect(getByText(`ICP`)).toBeTruthy();
  });

  it("should render a detailed balance in ICP", () => {
    const { queryByTestId } = renderWalletSummary(true);

    const icp: HTMLSpanElement | null = queryByTestId("token-value");

    expect(icp?.innerHTML).toEqual(
      `${formatToken({
        value: mockMainAccount.balanceE8s,
        detailed: true,
      })}`
    );
  });

  it("should contain a tooltip", () => {
    const { container } = renderWalletSummary();

    expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
  });

  it("should render a detailed balance in ICP in a tooltip", () => {
    const { container } = renderWalletSummary();

    const icp: HTMLDivElement | null = container.querySelector(
      "#wallet-detailed-icp"
    );

    expect(icp?.textContent).toEqual(
      replacePlaceholders(en.accounts.current_balance_detail, {
        $amount: `${formatToken({
          value: mockMainAccount.balanceE8s,
          detailed: true,
        })}`,
        $token: en.core.icp,
      })
    );
  });

  const testTitle = async ({
    intersecting,
    text,
  }: {
    intersecting: boolean;
    text: string;
  }) => {
    const { getByTestId } = renderWalletSummary();

    const element = getByTestId("wallet-summary") as HTMLElement;
    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    await waitFor(() => expect(title).toEqual(text));
  };

  it("should render account name and balance if title not intersecting viewport", async () =>
    await testTitle({
      intersecting: false,
      text: `${en.accounts.main} – ${formatToken({
        value: mockMainAccount.balanceE8s,
      })} ${ICPToken.symbol}`,
    }));

  it("should render a static title if title is intersecting viewport", async () =>
    await testTitle({ intersecting: true, text: en.wallet.title }));
});
