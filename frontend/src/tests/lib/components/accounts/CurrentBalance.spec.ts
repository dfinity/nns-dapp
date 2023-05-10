import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("CurrentBalance", () => {
  const props = { balance: mockMainAccount.balance };

  it("should render a title", () => {
    const { getByText } = render(CurrentBalance, { props });

    expect(
      getByText(en.accounts.current_balance, { exact: false })
    ).toBeTruthy();
  });

  it("should render a balance in ICP", () => {
    const { getByText, queryByTestId } = render(CurrentBalance, { props });

    const icp: HTMLSpanElement | null = queryByTestId("token-value");

    expect(icp?.innerHTML).toEqual(
      `${formatToken({ value: mockMainAccount.balance.toE8s() })}`
    );
    expect(getByText(`ICP`)).toBeTruthy();
  });
});
