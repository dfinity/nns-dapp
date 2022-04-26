/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import AddAccountType from "../../../../lib/components/accounts/AddAccountType.svelte";
import { addAccountStore } from "../../../../lib/stores/add-account.store";
import en from "../../../mocks/i18n.mock";
import AddAccountTest from "./AddAccountTest.svelte";

describe("AddAccountType", () => {
  const props = { testComponent: AddAccountType };

  afterEach(() =>
    addAccountStore.set({
      type: undefined,
      hardwareWalletName: undefined,
    })
  );

  it("should render two options for types", () => {
    const { queryByText } = render(AddAccountTest, {
      props,
    });

    expect(queryByText(en.accounts.new_linked_title)).toBeInTheDocument();

    expect(queryByText(en.accounts.attach_hardware_title)).toBeInTheDocument();
  });

    it("should select add account type subaccount", () => {

    });
});
