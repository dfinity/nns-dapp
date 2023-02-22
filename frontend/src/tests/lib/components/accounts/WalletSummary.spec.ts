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
import { render, waitFor } from "@testing-library/svelte";
import { get, writable } from "svelte/store";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("WalletSummary", () => {
  const renderWalletSummary = () =>
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

  it("should render a balance in ICP", () => {
    const { getByText, queryByTestId } = renderWalletSummary();

    const icp: HTMLSpanElement | null = queryByTestId("token-value");

    expect(icp?.innerHTML).toEqual(
      `${formatToken({ value: mockMainAccount.balance.toE8s() })}`
    );
    expect(getByText(`ICP`)).toBeTruthy();
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
          value: mockMainAccount.balance.toE8s(),
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
        value: mockMainAccount.balance.toE8s(),
      })} ${mockMainAccount.balance.token.symbol}`,
    }));

  it("should render a static title if title is intersecting viewport", async () =>
    await testTitle({ intersecting: true, text: en.wallet.title }));
});
