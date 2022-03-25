import { get } from "svelte/store";
import * as api from "../../../lib/api/accounts.api";
import {
  addSubAccount,
  syncAccounts,
} from "../../../lib/services/accounts.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";

describe("accounts-services", () => {
  const mockAccounts = { main: mockMainAccount, subAccounts: [] };

  const spyLoadAccounts = jest
    .spyOn(api, "loadAccounts")
    .mockImplementation(() => Promise.resolve(mockAccounts));

  const spyCreateSubAccount = jest
    .spyOn(api, "createSubAccount")
    .mockImplementation(() => Promise.resolve());

  it("should sync accounts", async () => {
    await syncAccounts();

    expect(spyLoadAccounts).toHaveBeenCalled();

    const accounts = get(accountsStore);
    expect(accounts).toEqual(mockAccounts);
  });

  it("should add a subaccount", async () => {
    await addSubAccount({ name: "test subaccount" });

    expect(spyCreateSubAccount).toHaveBeenCalled();
  });

  it("should not sync accounts if no identity", async () => {
    setNoIdentity();

    const call = async () => await syncAccounts();

    await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

    resetIdentity();
  });

  it("should not add subaccount if no identity", async () => {
    setNoIdentity();

    const call = async () => await addSubAccount({ name: "test subaccount" });

    await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

    resetIdentity();
  });
});
