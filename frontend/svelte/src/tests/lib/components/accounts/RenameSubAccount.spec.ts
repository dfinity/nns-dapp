/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import RenameSubAccount from "../../../../lib/components/accounts/RenameSubAccount.svelte";
import en from "../../../mocks/i18n.mock";

describe("RenameSubAccount", () => {
  it("should contains a closed modal per default", () => {
    const { getByText } = render(RenameSubAccount, {
      props: { selectedAccount: undefined },
    });
    expect(
      getByText(en.accounts.rename_linked_account)
    ).not.toBeInTheDocument();
  });

  it("should contains an action named rename", async () => {
    const { getByText } = render(RenameSubAccount, {
      props: { selectedAccount: undefined },
    });
    expect(getByText(en.accounts.rename)).not.toBeInTheDocument();
  });

  it("should open modal", async () => {
    const { getByText, getByTestId } = render(RenameSubAccount, {
      props: { selectedAccount: undefined },
    });
    await fireEvent.click(
      getByTestId("open-rename-subaccount-button") as HTMLButtonElement
    );
    expect(getByText(en.accounts.rename_linked_account)).toBeInTheDocument();
  });
});
