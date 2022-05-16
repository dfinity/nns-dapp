/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import AddAccountType from "../../../../lib/components/accounts/AddAccountType.svelte";
import {
  addAccountStore,
  type AccountType,
} from "../../../../lib/stores/add-account.store";
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

  const testSelectType = async ({
    type,
    selector,
  }: {
    type: AccountType;
    selector: string;
  }) => {
    const { container } = render(AddAccountTest, {
      props,
    });

    const div = container.querySelector(selector) as HTMLButtonElement;
    fireEvent.click(div);

    await waitFor(() => expect(get(addAccountStore).type).toEqual(type));
  };

  it("should select add account type subaccount", async () =>
    testSelectType({
      type: "subAccount",
      selector: 'div[role="button"]:first-of-type',
    }));

  it("should select add account type hardwareWallet", async () =>
    testSelectType({
      type: "hardwareWallet",
      selector: 'div[role="button"]:last-of-type',
    }));
});
