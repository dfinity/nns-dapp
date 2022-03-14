import { get } from "svelte/store";
import * as api from "../../../lib/api/accounts.api";
import {
  addSubAccount,
  syncAccounts,
} from "../../../lib/services/accounts.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("accounts-services", () => {
  const mockAccounts = { main: mockMainAccount, subAccounts: [] };

  const spyLoadAccounts = jest
    .spyOn(api, "loadAccounts")
    .mockImplementation(() => Promise.resolve(mockAccounts));

  const spyCreateSubAccount = jest
    .spyOn(api, "createSubAccount")
    .mockImplementation(() => Promise.resolve());

  it("should sync accounts", async () => {
    await syncAccounts({ identity: mockIdentity });

    expect(spyLoadAccounts).toHaveBeenCalled();

    const accounts = get(accountsStore);
    expect(accounts).toEqual(mockAccounts);
  });

  it("should add a subaccount", async () => {
    await addSubAccount({ name: "test subaccount", identity: mockIdentity });

    expect(spyCreateSubAccount).toHaveBeenCalled();
  });

  it("should not sync accounts if no identity", async () => {
    const call = async () => await syncAccounts({ identity: null });

    await expect(call).rejects.toThrow(Error("No identity"));
  });

  it("should not add subaccount if no identity", async () => {
    const call = async () =>
      await addSubAccount({ name: "test subaccount", identity: null });

    await expect(call).rejects.toThrow(
      Error("No identity found to create subaccount")
    );
  });
});
