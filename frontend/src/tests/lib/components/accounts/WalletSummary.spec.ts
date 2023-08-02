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
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { ICPToken, type Token } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get, writable } from "svelte/store";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("WalletSummary", () => {
  const renderWalletSummary = ({
    detailedBalance,
    token,
  }: {
    detailedBalance?: boolean;
    token: Token | undefined;
  }) =>
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
          token,
        },
      },
    });

  const props = { token: ICPToken };

  it("should render title", () => {
    const { getByText } = renderWalletSummary(props);

    expect(getByText(en.accounts.main)).toBeInTheDocument();
  });

  it("should render an account identifier", () => {
    const { getByText } = renderWalletSummary(props);

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a shortened balance in ICP", () => {
    const { getByText, queryByTestId } = renderWalletSummary(props);

    const icp: HTMLSpanElement | null = queryByTestId("token-value");

    expect(icp?.innerHTML).toEqual(
      `${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
    expect(getByText(`ICP`)).toBeTruthy();
  });

  it("should render a detailed balance in ICP", () => {
    const { queryByTestId } = renderWalletSummary({
      ...props,
      detailedBalance: true,
    });

    const icp: HTMLSpanElement | null = queryByTestId("token-value");

    expect(icp?.innerHTML).toEqual(
      `${formatToken({
        value: mockMainAccount.balanceE8s,
        detailed: true,
      })}`
    );
  });

  it("should contain a tooltip", () => {
    const { container } = renderWalletSummary(props);

    expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
  });

  it("should render a detailed balance in ICP in a tooltip", () => {
    const { container } = renderWalletSummary(props);

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
    header,
  }: {
    intersecting: boolean;
    header: string;
  }) => {
    const { getByTestId } = renderWalletSummary(props);

    const element = getByTestId("wallet-summary") as HTMLElement;
    dispatchIntersecting({ element, intersecting });

    const title = get(layoutTitleStore);
    await waitFor(() =>
      expect(title).toEqual({ title: en.wallet.title, header })
    );
  };

  it("should render account name and balance if title not intersecting viewport", async () =>
    await testTitle({
      intersecting: false,
      header: `${en.accounts.main} – ${formatToken({
        value: mockMainAccount.balanceE8s,
      })} ${ICPToken.symbol}`,
    }));

  it("should render a static title if title is intersecting viewport", async () =>
    await testTitle({ intersecting: true, header: en.wallet.title }));

  it("should not render a balance if token is unlikely undefined", () => {
    const { container } = renderWalletSummary({
      ...props,
      token: undefined,
    });

    expect(container.querySelector("#wallet-detailed-icp")).toBeNull();
  });
});
