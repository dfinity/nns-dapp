/**
 * @jest-environment jsdom
 */

import { createSubAccount, loadAccounts } from "$lib/api/accounts.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import Accounts from "$lib/routes/Accounts.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mockMainAccount, mockSubAccount } from "../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import { clickByTestId } from "../utils/utils.test-utils";

jest.mock("$lib/api/accounts.api", () => {
  return {
    createSubAccount: jest.fn().mockResolvedValue(undefined),
    loadAccounts: jest.fn().mockImplementation(() =>
      Promise.resolve({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [],
      })
    ),
  };
});

describe("Accounts", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest.spyOn(console, "error").mockImplementation(jest.fn);
  });

  it("should create a subaccount in NNS", async () => {
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    accountsStore.set({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const { queryByTestId, container } = render(Accounts);

    await waitFor(() =>
      expect(queryByTestId("open-add-account-modal")).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "open-add-account-modal");

    await waitFor(() =>
      expect(queryByTestId("choose-linked-as-account-type")).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "choose-linked-as-account-type");

    await waitFor(() =>
      expect(
        container.querySelector('input[name="newAccount"]')
      ).toBeInTheDocument()
    );
    const input = container.querySelector('input[name="newAccount"]');
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() => expect(createSubAccount).toHaveBeenCalled());
    await waitFor(() => expect(loadAccounts).toBeCalled());
  });
});
