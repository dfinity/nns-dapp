/**
 * @jest-environment jsdom
 */

import CurrentBalance from "$lib/components/accounts/CurrentBalance.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

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
