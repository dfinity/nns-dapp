/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import AccountBadge from "../../../../lib/components/accounts/AccountBadge.svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";

describe("AccountBadge", () => {
  it("should render no badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockMainAccount },
    });

    expect(() =>
      getByText(en.accounts.linked_account, { exact: false })
    ).toThrow();
  });

  it("should render linked account badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: { ...mockMainAccount, subAccount: ["test"] } },
    });

    expect(
      getByText(en.accounts.linked_account, { exact: false })
    ).toBeInTheDocument();
  });
});
