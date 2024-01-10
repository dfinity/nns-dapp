import { createSubAccount } from "$lib/api/accounts.api";
import * as agent from "$lib/api/agent.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import Accounts from "$lib/routes/Accounts.svelte";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import type { SpyInstance } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/accounts.api", () => {
  return {
    createSubAccount: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/api/icp-ledger.api");

vi.mock("$lib/api/nns-dapp.api");

describe("Accounts", () => {
  let queryAccountBalanceSpy: SpyInstance;
  let queryAccountSpy: SpyInstance;
  beforeEach(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    vi.spyOn(console, "error").mockImplementation(vi.fn);
    queryAccountBalanceSpy = vi
      .spyOn(ledgerApi, "queryAccountBalance")
      .mockResolvedValue(0n);
    queryAccountSpy = vi
      .spyOn(nnsDappApi, "queryAccount")
      .mockResolvedValue(mockAccountDetails);
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
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
