import { ICP } from "@dfinity/nns";
import { get } from "svelte/store";
import * as accountsApi from "../../../lib/api/accounts.api";
import * as ledgerApi from "../../../lib/api/ledger.api";
import {
  addSubAccount,
  syncAccounts,
  transferICP,
  TransferICPError,
} from "../../../lib/services/accounts.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import type { TransactionStore } from "../../../lib/stores/transaction.store";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";

describe("accounts-services", () => {
  const mockAccounts = { main: mockMainAccount, subAccounts: [] };

  const spyLoadAccounts = jest
    .spyOn(accountsApi, "loadAccounts")
    .mockImplementation(() => Promise.resolve(mockAccounts));

  const spyCreateSubAccount = jest
    .spyOn(accountsApi, "createSubAccount")
    .mockImplementation(() => Promise.resolve());

  const spySendICP = jest
    .spyOn(ledgerApi, "sendICP")
    .mockImplementation(() => Promise.resolve(BigInt(0)));

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

  const transferICPParams: TransactionStore = {
    selectedAccount: mockMainAccount,
    destinationAddress: mockSubAccount.identifier,
    amount: ICP.fromE8s(BigInt(1)),
  };

  it("should transfer ICP", async () => {
    await transferICP(transferICPParams);

    expect(spySendICP).toHaveBeenCalled();
  });

  it("should sync accounts after transfer ICP", async () => {
    await transferICP(transferICPParams);

    expect(spyLoadAccounts).toHaveBeenCalled();
  });

  it("should throw errors if transfer params not provided", async () => {
    let call = async () =>
      await transferICP({
        ...transferICPParams,
        selectedAccount: undefined,
      });

    await expect(call).rejects.toThrow(
      new TransferICPError(en.error.transaction_no_source_account)
    );

    call = async () =>
      await transferICP({
        ...transferICPParams,
        destinationAddress: undefined,
      });

    await expect(call).rejects.toThrow(
      new TransferICPError(en.error.transaction_no_destination_address)
    );

    call = async () =>
      await transferICP({
        ...transferICPParams,
        amount: undefined,
      });

    await expect(call).rejects.toThrow(
      new TransferICPError(en.error.transaction_invalid_amount)
    );
  });
});
