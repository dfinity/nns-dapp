/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import AccountCard from "../../../../lib/components/accounts/AccountCard.svelte";
import type { Account } from "../../../../lib/types/account";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";

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

    expect(balance?.textContent).toEqual(
      `${formatICP(mockMainAccount.balance.toE8s())}`
    );
  });

  it("should add the role passed", () => {
    const { container } = render(AccountCard, {
      props: { ...props, role: "link" },
    });

    const article = container.querySelector("article");

    expect(article?.getAttribute("role")).toEqual("link");
  });
});
