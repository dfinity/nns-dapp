import RenameSubAccount from "$lib/components/accounts/RenameSubAccountButton.svelte";
import WalletContextTest from "$tests/lib/components/accounts/WalletContextTest.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";

describe("RenameSubAccountButton", () => {
  const renderTestCmp = () =>
    render(WalletContextTest, {
      props: {
        account: mockMainAccount,
        testComponent: RenameSubAccount,
      },
    });

  it("should contain a closed modal per default", () => {
    const { getByText } = renderTestCmp();
    expect(() => getByText(en.accounts.rename_linked_account)).toThrow();
  });

  it("should contain an action named rename", async () => {
    const { getByText } = renderTestCmp();
    expect(getByText(en.accounts.rename)).toBeInTheDocument();
  });

  it("should open modal", async () => {
    const { getByTestId, container } = renderTestCmp();
    await fireEvent.click(
      getByTestId("open-rename-subaccount-button") as HTMLButtonElement
    );

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
    await waitFor(() =>
      expect(getByTestId("confirm-text-input-screen-button")).not.toBeNull()
    );
  });
});
