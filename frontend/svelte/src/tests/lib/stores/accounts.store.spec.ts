import { ICP } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  AccountsStore,
  accountsStore,
} from "../../../lib/stores/accounts.store";
import type { Account } from "../../../lib/types/account";
import * as accountUtils from "../../../lib/utils/accounts.utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";

describe("accounts-store", () => {
  it("should load accounts", async () => {
    const mockAccount: Account = {
      identifier:
        "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
      balance: ICP.fromString("1234567.8901") as ICP,
    };
    const mockReturn: AccountsStore = {
      main: mockAccount,
      subAccounts: [],
    };
    jest
      .spyOn(accountUtils, "loadAccounts")
      .mockImplementation(async (): Promise<AccountsStore> => mockReturn);
    await accountsStore.sync({ principal: mockPrincipal });

    const accounts = get(accountsStore);
    expect(accounts.main).toEqual(mockAccount);
    expect(accounts.subAccounts.length).toEqual(0);
  });

  it("should add new subaccounts", async () => {
    const mockAccount: Account = {
      identifier:
        "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
      balance: ICP.fromString("1234567.8901") as ICP,
      name: "subAccount",
    };
    jest
      .spyOn(accountUtils, "createSubAccount")
      .mockImplementation(async (): Promise<Account> => mockAccount);
    await accountsStore.createSubAccount("subAccount");

    const accounts = get(accountsStore);
    expect(accounts.subAccounts.length).toEqual(1);
  });
});
