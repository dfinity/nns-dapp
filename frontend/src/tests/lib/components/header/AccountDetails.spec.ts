import AccountDetails from "$lib/components/header/AccountDetails.svelte";
import { mockPrincipalText, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { AccountDetailsPo } from "$tests/page-objects/AccountDetails.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";

describe("AccountDetails", () => {
  const renderComponent = () => {
    const { container } = render(AccountDetails);
    return AccountDetailsPo.under(new JestPageObjectElement(container));
  };
  it("should display main ICP account ID if available", async () => {
    const accountIdForTesting = "82376428374628347628347263847263847623";
    setAccountsForTesting({
      main: {
        ...mockMainAccount,
        identifier: accountIdForTesting,
      },
    });
    const accountDetailsPo = renderComponent();

    const mainAccountId = await accountDetailsPo.getMainIcpAccountId();

    expect(mainAccountId).toBe(accountIdForTesting);
  });

  it("should display principal ID if available", async () => {
    resetIdentity();
    const accountDetailsPo = renderComponent();

    expect(await accountDetailsPo.getPrincipalId()).toBe(mockPrincipalText);
  });

  it("should display tooltip for main ICP account ID if available", async () => {
    const accountDetailsPo = renderComponent();

    expect(await accountDetailsPo.getMainIcpAccountIdTooltipId()).toMatch(
      /main-icp-account-id-tooltip/
    );
    expect(await accountDetailsPo.getMainIcpAccountIdTooltipText()).toBe(
      "You can send ICP both to your principal ID and account ID, however some exchanges or wallets may not support transactions using a principal ID."
    );
  });
});
