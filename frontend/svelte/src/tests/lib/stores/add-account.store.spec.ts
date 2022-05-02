import { get } from "svelte/store";
import {
  addAccountStore,
  type AddAccountStore,
} from "../../../lib/stores/add-account.store";

describe("add-account-store", () => {
  const mock: AddAccountStore = {
    type: "hardwareWallet",
    hardwareWalletName: "test",
  };

  it("should set store", () => {
    addAccountStore.set(mock);

    const accountStore = get(addAccountStore);
    expect(accountStore).toEqual(mock);
  });

  it("should clear store", () => {
    addAccountStore.set(mock);

    const clearMock: AddAccountStore = {
      type: undefined,
      hardwareWalletName: undefined,
    };

    addAccountStore.set(clearMock);

    const accountStore = get(addAccountStore);
    expect(accountStore).toEqual(clearMock);
  });
});
