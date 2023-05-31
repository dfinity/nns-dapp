import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { AccountsStoreData } from "$lib/stores/accounts.store";
import type { Account } from "$lib/types/account";
import { amountFromString } from "$tests/utils/utils.test-utils";
import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";

export const mockMainAccount: Account = {
  identifier:
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  balanceE8s: amountFromString("1234567.8901"),
  principal: Principal.fromText("aaaaa-aa"),
  type: "main",
};

export const mockSubAccountArray = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1,
];

export const mockSubAccount: Account = {
  identifier:
    "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
  balanceE8s: amountFromString("1234567.8901"),
  subAccount: mockSubAccountArray,
  name: "test subaccount",
  type: "subAccount",
};

export const mockHardwareWalletAccount: Account = {
  identifier:
    "646f4d2d6fcb6fab5ba1547647526b666553467ecb5cb28c8d9ddf451c8f4c21",
  balanceE8s: amountFromString("1234567.8901"),
  principal: Principal.fromText(
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
  ),
  name: "hardware wallet account test",
  type: "hardwareWallet",
};

export const mockAccountDetails: AccountDetails = {
  principal: Principal.fromText("aaaaa-aa"),
  sub_accounts: [],
  hardware_wallet_accounts: [],
  account_identifier: mockMainAccount.identifier,
};

export const mockSubAccountDetails: SubAccountDetails = {
  name: "test",
  sub_account: [0, 0],
  account_identifier: mockSubAccount.identifier,
};

export const mockHardwareWalletAccountDetails: HardwareWalletAccountDetails = {
  name: "ledger test",
  principal: Principal.fromText(
    "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
  ),
  account_identifier:
    "646f4d2d6fcb6fab5ba1547647526b666553467ecb5cb28c8d9ddf451c8f4c21",
};

export const mockAccountsStoreData = {
  main: mockMainAccount,
  subAccounts: [],
  hardwareWallets: [],
  certified: true,
};

export const mockAccountsStoreSubscribe =
  (subAccounts: Account[] = [], hardwareWalletAccounts: Account[] = []) =>
  (run: Subscriber<AccountsStoreData>): (() => void) => {
    run({
      main: mockMainAccount,
      subAccounts,
      hardwareWallets: hardwareWalletAccounts,
    });

    return () => undefined;
  };

export const mockAddressInputValid =
  "cd70bfa0f092c38a0ff8643d4617219761eb61d199b15418c0b1114d59e30f8e";
export const mockAddressInputInvalid = "not-valid";
