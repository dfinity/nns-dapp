import AccountBadge from "$lib/components/accounts/AccountBadge.svelte";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("AccountBadge", () => {
  it("should render no badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockMainAccount },
    });

    expect(() => getByText(en.accounts.subAccount, { exact: false })).toThrow();
  });

  it("should render linked account badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockSubAccount },
    });

    expect(getByText(en.accounts.subAccount)).toBeInTheDocument();
  });

  it("should render hardware wallet badge", () => {
    const { getByText } = render(AccountBadge, {
      props: { account: mockHardwareWalletAccount },
    });

    expect(getByText(en.accounts.hardwareWallet)).toBeInTheDocument();
  });
});
