import AccountCard from "$lib/components/accounts/AccountCard.svelte";
import type { Account } from "$lib/types/account";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import type { Token } from "@dfinity/utils";
import { ICPToken } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("AccountCard", () => {
  const props: { account: Account; token: Token } = {
    account: mockMainAccount,
    token: ICPToken,
  };

  it("should render an account identifier", () => {
    const { getByText } = render(AccountCard, {
      props,
    });

    expect(
      getByText(mockMainAccount.identifier, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a hashed account identifier", () => {
    const { getByText } = render(AccountCard, {
      props: {
        ...props,
        hash: true,
      },
    });

    expect(
      getByText(shortenWithMiddleEllipsis(mockMainAccount.identifier), {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it("should render an account balance", () => {
    const { container } = render(AccountCard, {
      props,
    });

    const balance = container.querySelector("article > div span:first-of-type");

    expect(balance?.textContent).toEqual(
      `${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
  });

  it("should add the role passed", () => {
    const { container } = render(AccountCard, {
      props: { ...props, role: "link" },
    });

    const article = container.querySelector("article");

    expect(article?.getAttribute("role")).toEqual("link");
  });

  it("should render no amount if token is unlikely undefined", () => {
    const { getByTestId } = render(AccountCard, {
      props: {
        ...props,
        token: undefined,
      },
    });

    expect(() => getByTestId("token-value-label")).toThrow();
  });
});
