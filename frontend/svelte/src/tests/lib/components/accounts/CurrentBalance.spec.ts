/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CurrentBalance from "../../../../lib/components/accounts/CurrentBalance.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("CurrentBalance", () => {
  const props = { account: mockMainAccount };

  it("should render a title", () => {
    const { getByText } = render(CurrentBalance, { props });

    expect(
      getByText(en.accounts.current_balance, { exact: false })
    ).toBeTruthy();
  });

  it("should render a balance in ICP", () => {
    const { getByText, queryByTestId } = render(CurrentBalance, { props });

    const icp: HTMLSpanElement | null = queryByTestId("icp-value");

    expect(icp?.innerHTML).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())}`
    );
    expect(getByText(`ICP`)).toBeTruthy();
  });

  it("should render a zero balance as fallback", () => {
    const { queryByTestId } = render(CurrentBalance, {
      props: { account: undefined },
    });

    const icp: HTMLSpanElement | null = queryByTestId("icp-value");

    expect(icp?.innerHTML).toEqual("0.00000000");
  });
});
