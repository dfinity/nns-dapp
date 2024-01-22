import AccountBadge from "$lib/components/accounts/AccountBadge.svelte";
import en from "$tests/mocks/i18n.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { render } from "@testing-library/svelte";

describe("AccountBadge", () => {
  it("should render no badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockMainAccount },
    });

    expect(() => getByText("Linked Account", { exact: false })).toThrow();
  });

  it("should not render linked account badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockSubAccount },
    });

    expect(() => getByText("Linked Account", { exact: false })).toThrow();
  });

  it("should render hardware wallet badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockHardwareWalletAccount },
    });

    expect(getByText(en.accounts.hardwareWallet)).toBeInTheDocument();
  });
});
