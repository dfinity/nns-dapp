/**
 * @jest-environment jsdom
 */

import TransactionSource from "$lib/modals/accounts/NewTransaction/TransactionSource.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("TransactionSource", () => {
  it("should render info texts", () => {
    const { getByText } = render(TransactionSource, {
      props: { account: mockMainAccount },
    });

    expect(getByText(en.accounts.source)).toBeInTheDocument();
    expect(getByText(en.accounts.balance)).toBeInTheDocument();
  });

  it("should render balance", () => {
    const { getByTestId } = render(TransactionSource, {
      props: { account: mockMainAccount },
    });

    expect(getByTestId("token-value")?.textContent ?? "").toEqual(
      `${formatToken({ value: mockMainAccount.balance.toE8s() })}`
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
