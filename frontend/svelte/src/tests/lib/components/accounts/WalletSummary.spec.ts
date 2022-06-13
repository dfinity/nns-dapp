/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import WalletSummary from "../../../../lib/components/accounts/WalletSummary.svelte";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountContext,
  type SelectedAccountStore,
} from "../../../../lib/types/selected-account.context";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("WalletSummary", () => {
  const renderWalletSummary = () =>
    render(ContextWrapperTest, {
      props: {
        contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
        contextValue: {
          store: writable<SelectedAccountStore>({
            account: mockMainAccount,
            transactions: undefined,
          }),
        } as SelectedAccountContext,
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

    const icp: HTMLSpanElement | null = queryByTestId("icp-value");

    expect(icp?.innerHTML).toEqual(
      `${formatICP({ value: mockMainAccount.balance.toE8s() })}`
    );
    expect(getByText(`ICP`)).toBeTruthy();
  });
});
