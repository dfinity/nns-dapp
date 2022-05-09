import { ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";
import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "../../lib/canisters/nns-dapp/nns-dapp.types";
import type { AccountsStore } from "../../lib/stores/accounts.store";
import type { Account } from "../../lib/types/account";

export const mockMainAccount: Account = {
  identifier:
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  balance: ICP.fromString("1234567.8901") as ICP,
  principal: Principal.fromText("aaaaa-aa"),
  type: "main",
};

export const mockSubAccount: Account = {
  identifier:
    "aaaa5b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  balance: ICP.fromString("1234567.8901") as ICP,
  name: "test subaccount",
  type: "subAccount",
};

export const mockHardwareWalletAccount: Account = {
  identifier:
    "646f4d2d6fcb6fab5ba1547647526b666553467ecb5cb28c8d9ddf451c8f4c21",
  balance: ICP.fromString("12345.8901") as ICP,
  principal: Principal.fromText(
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
  ),
  type: "hardwareWallet",
};

export const mockAccountDetails: AccountDetails = {
  principal: Principal.fromText("aaaaa-aa"),
  sub_accounts: [],
  hardware_wallet_accounts: [],
  account_identifier: "account-identifier",
};

export const mockSubAccountDetails: SubAccountDetails = {
  name: "test",
  sub_account: [0, 0],
  account_identifier: "account-identifier",
};

export const mockHardwareWalletAccountDetails: HardwareWalletAccountDetails = {
  name: "ledger test",
  principal: Principal.fromText(
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
  ),
  account_identifier:
    "646f4d2d6fcb6fab5ba1547647526b666553467ecb5cb28c8d9ddf451c8f4c21",
};

export const mockAccountsStoreSubscribe =
  (subAccounts: Account[] = [], hardwareWalletAccounts: Account[] = []) =>
  (run: Subscriber<AccountsStore>): (() => void) => {
    run({
      main: mockMainAccount,
      subAccounts,
      hardwareWallets: hardwareWalletAccounts,
    });

    return () => undefined;
  };

export const mockAddressInput = (length: number): string =>
  Array.from(Array(length))
    .map(() => "a")
    .join("");
