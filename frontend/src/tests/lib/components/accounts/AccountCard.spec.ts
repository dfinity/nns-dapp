/**
 * @jest-environment jsdom
 */

import AccountCard from "$lib/components/accounts/AccountCard.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Account } from "$lib/types/account";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { buildWalletUrl } from "$lib/utils/navigation.utils";
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

    const balance = container.querySelector(
      '[data-tid="account-card"] > div span:first-of-type'
    );

    expect(balance?.textContent).toEqual(
      `${formatToken({ value: mockMainAccount.balanceE8s })}`
    );
  });

  it("should render a hyperlink if role link", () => {
    const { getByTestId } = render(AccountCard, {
      props: { ...props, role: "link" },
    });

    const linkElement = getByTestId("account-card");
    expect(linkElement?.tagName.toLowerCase()).toEqual("a");
    expect(linkElement?.getAttribute("href")).toEqual(
      buildWalletUrl({
        universe: OWN_CANISTER_ID_TEXT,
        account: mockMainAccount.identifier,
      })
    );
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
