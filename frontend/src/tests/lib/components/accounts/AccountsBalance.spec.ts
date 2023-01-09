/**
 * @jest-environment jsdom
 */

import AccountsBalance from "$lib/components/accounts/AccountsBalance.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";

describe("AccountsBalance", () => {
  it("should render no balance", () => {
    const { getByTestId } = render(AccountsBalance, {
      props: { balance: undefined },
    });

    expect(() => getByTestId("token-value")).toThrow();
  });

  it("should render balance", () => {
    const { getByTestId } = render(AccountsBalance, {
      props: { balance: mockMainAccount.balance },
    });
    expect(getByTestId("token-value")).not.toBeNull();
    expect(getByTestId("token-value")?.textContent ?? "").toEqual(
      `${formatToken({ value: mockMainAccount.balance.toE8s() })}`
    );
  });
});
