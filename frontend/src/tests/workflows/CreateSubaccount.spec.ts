import { createSubAccount } from "$lib/api/accounts.api";
import * as agent from "$lib/api/agent.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import Accounts from "$lib/routes/Accounts.svelte";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockMainAccount,
  mockSubAccountDetails,
} from "$tests/mocks/icp-accounts.store.mock";
import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/accounts.api", () => {
  return {
    createSubAccount: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/api/icp-ledger.api");

vi.mock("$lib/api/nns-dapp.api");

describe("Accounts", () => {
  const newSubaccountName = "test name";

  const mockSubaccount = {
    ...mockSubAccountDetails,
    name: newSubaccountName,
  };
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
    vi.spyOn(console, "error").mockImplementation(vi.fn);

    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(0n);
    vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue({
      ...mockAccountDetails,
      sub_accounts: [mockSubaccount],
    });
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("when tokens page flag is enabled", async () => {
    it("should create a subaccount in NNS", async () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
      setAccountsForTesting({
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
