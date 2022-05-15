/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import RenameSubAccountModal from "../../../../lib/modals/accounts/RenameSubAccountModal.svelte";
import { mockSubAccount } from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("RenameSubAccountModal", () => {
  it("should display modal", () => {
    const { container } = render(RenameSubAccountModal, {
      props: { selectedAccount: undefined },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(RenameSubAccountModal, {
      props: { selectedAccount: undefined },
    });

    expect(getByText(en.accounts.rename_linked_account)).toBeInTheDocument();
  });

  it("should render rename action", async () => {
    const { getByTestId } = await renderModal({
      component: RenameSubAccountModal,
      props: { selectedAccount: mockSubAccount },
    });

    expect(getByTestId("rename-subaccount-button")).not.toBeNull();
  });
});
