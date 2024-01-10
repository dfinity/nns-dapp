import RenameSubAccountModal from "$lib/modals/accounts/RenameSubAccountModal.svelte";
import type { Account } from "$lib/types/account";
import { renderSelectedAccountContext } from "$tests/mocks/context-wrapper.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSubAccount } from "$tests/mocks/icp-accounts.store.mock";
import { renderModalSelectedAccountContextWrapper } from "$tests/mocks/modal.mock";

describe("RenameSubAccountModal", () => {
  const renderTestCmp = (account: Account | undefined) =>
    renderSelectedAccountContext({
      Component: RenameSubAccountModal,
      account,
    });

  const renderTestModalCmp = (account: Account | undefined) =>
    renderModalSelectedAccountContextWrapper({
      Component: RenameSubAccountModal,
      account,
    });

  it("should display modal", () => {
    const { container } = renderTestCmp(undefined);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = renderTestCmp(undefined);

    expect(getByText(en.accounts.rename_linked_account)).toBeInTheDocument();
  });

  it("should render rename action", async () => {
    const { getByTestId } = await renderTestModalCmp(mockSubAccount);

    expect(getByTestId("confirm-text-input-screen-button")).not.toBeNull();
  });
});
