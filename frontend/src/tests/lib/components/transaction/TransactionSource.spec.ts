/**
 * @jest-environment jsdom
 */

import TransactionSource from "$lib/components/transaction/TransactionSource.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("TransactionSource", () => {
  it("should render info texts", () => {
    const { getByText } = render(TransactionSource, {
      props: { account: mockMainAccount },
    });

    expect(getByText(en.accounts.from, { exact: false })).toBeInTheDocument();
    expect(getByText(en.accounts.balance)).toBeInTheDocument();
  });

  it("should render balance", () => {
    const { getByTestId } = render(TransactionSource, {
      props: { account: mockMainAccount },
    });

    expect(getByTestId("token-value")?.textContent ?? "").toEqual(
      `${formatToken({
        value: mockMainAccount.balance.toE8s(),
        detailed: true,
      })}`
    );
  });

  it("should render identifier", () => {
    const { getByTestId } = render(TransactionSource, {
      props: { account: mockMainAccount },
    });

    expect(
      (
        getByTestId("transaction-review-source-account").textContent ?? ""
      ).includes(mockMainAccount.identifier)
    ).toBeTruthy();
  });

  it("should render name", () => {
    const account = {
      ...mockMainAccount,
      name: "Test",
    };

    const { getByTestId } = render(TransactionSource, {
      props: { account },
    });

    expect(
      (
        getByTestId("transaction-review-source-account-name").textContent ?? ""
      ).includes(account.name)
    ).toBeTruthy();
  });
});
