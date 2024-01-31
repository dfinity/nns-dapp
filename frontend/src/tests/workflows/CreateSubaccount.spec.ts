import { createSubAccount } from "$lib/api/accounts.api";
import * as agent from "$lib/api/agent.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import Accounts from "$lib/routes/Accounts.svelte";
import { authStore } from "$lib/stores/auth.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { page } from "$mocks/$app/stores";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockMainAccount,
  mockSubAccountDetails,
} from "$tests/mocks/icp-accounts.store.mock";
import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
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
  const newSubaccountName = "test name";

  const mockSubaccount = {
    ...mockSubAccountDetails,
    name: newSubaccountName,
  };
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    vi.spyOn(console, "error").mockImplementation(vi.fn);

    queryAccountBalanceSpy = vi
      .spyOn(ledgerApi, "queryAccountBalance")
      .mockResolvedValue(0n);
    queryAccountSpy = vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue({
      ...mockAccountDetails,
      sub_accounts: [mockSubaccount],
    });
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
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

  describe("when tokens page flag is enabled", async () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
    });

    it("should create a subaccount in NNS", async () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [],
        hardwareWallets: [],
      });
      const { container } = render(Accounts);

      const accountsPo = AccountsPo.under(new JestPageObjectElement(container));

      await accountsPo.getNnsAccountsPo().clickAddAccount();

      const initialRows = await accountsPo
        .getNnsAccountsPo()
        .getTokensTablePo()
        .getRows();
      expect(initialRows.length).toBe(1);
      expect(await initialRows[0].getProjectName()).toBe("Main");
      expect(createSubAccount).not.toHaveBeenCalled();

      const modalPo = accountsPo.getAddAccountModalPo();
      await modalPo.waitFor();
      await modalPo.addAccount(newSubaccountName);
      await modalPo.waitForClosed();

      const subAccountRow = await accountsPo
        .getNnsAccountsPo()
        .getTokensTablePo()
        .getRowByName(newSubaccountName);
      await subAccountRow.waitFor();
      expect(await subAccountRow.getProjectName()).toBe(newSubaccountName);

      expect(createSubAccount).toHaveBeenCalledTimes(1);
      expect(createSubAccount).toHaveBeenCalledWith({
        name: newSubaccountName,
        identity: mockIdentity,
      });
    });
  });
});
