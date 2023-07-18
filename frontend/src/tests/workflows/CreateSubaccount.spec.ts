/**
 * @jest-environment jsdom
 */

import { createSubAccount } from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import Accounts from "$lib/routes/Accounts.svelte";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { page } from "$mocks/$app/stores";
import {
  mockAccountDetails,
  mockMainAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

jest.mock("$lib/api/accounts.api", () => {
  return {
    createSubAccount: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/api/icp-ledger.api");

jest.mock("$lib/api/nns-dapp.api");

describe("Accounts", () => {
  let queryAccountBalanceSpy: jest.SpyInstance;
  let queryAccountSpy: jest.SpyInstance;
  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest.spyOn(console, "error").mockImplementation(jest.fn);
    queryAccountBalanceSpy = jest
      .spyOn(ledgerApi, "queryAccountBalance")
      .mockResolvedValue(BigInt(0));
    queryAccountSpy = jest
      .spyOn(nnsDappApi, "queryAccount")
      .mockResolvedValue(mockAccountDetails);
  });

  it("should create a subaccount in NNS", async () => {
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    icpAccountsStore.setForTesting({
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
        container.querySelector('input[name="add-text-input"]')
      ).toBeInTheDocument()
    );
    const input = container.querySelector('input[name="add-text-input"]');
    input && (await fireEvent.input(input, { target: { value: "test name" } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() => expect(createSubAccount).toHaveBeenCalled());
    await waitFor(() => expect(queryAccountSpy).toBeCalled());
    await waitFor(() => expect(queryAccountBalanceSpy).toBeCalled());
  });
});
