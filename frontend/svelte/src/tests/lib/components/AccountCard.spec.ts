/**
 * @jest-environment jsdom
 */

import type { Account } from "../../../lib/types/account";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { render } from "@testing-library/svelte";
import AccountCard from "../../../lib/components/AccountCard.svelte";
import { formatICP } from "../../../lib/utils/icp.utils";

describe("AccountCard", () => {
  const props: { account: Account } = { account: mockMainAccount };

  it("should render an account identifier", () => {
    const { getByText } = render(AccountCard, {
      props,
    });

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render an account balance", () => {
    const { container } = render(AccountCard, {
      props,
    });

    const balance = container.querySelector("article > div span:first-of-type");

    expect(balance.textContent).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())}`
    );
  });
});
