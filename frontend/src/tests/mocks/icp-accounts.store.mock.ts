import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { IcpAccountsStoreData } from "$lib/stores/icp-accounts.store";
import type { Account, IcpAccount } from "$lib/types/account";
import { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";

export const mockMainAccount: IcpAccount = {
  identifier:
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  icpIdentifier:
    "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  balanceE8s: 123456789010000n,
  principal: Principal.fromText("aaaaa-aa"),
  type: "main",
};

export const mockSubAccountArray = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 1,
];

export const mockSubAccount: IcpAccount = {
  identifier:
    "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
  icpIdentifier:
    "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
  balanceE8s: 123456789010000n,
  subAccount: mockSubAccountArray,
  name: "test subaccount",
  type: "subAccount",
};

const hardwareWalletPrincipal = Principal.fromText(
  "2vtpp-r6lcd-cbfas-qbabv-wxrv5-lsrkj-c4dtb-6ets3-srlqe-xpuzf-vqe"
);

export const mockHardwareWalletAccount: IcpAccount = {
  identifier:
    "646f4d2d6fcb6fab5ba1547647526b666553467ecb5cb28c8d9ddf451c8f4c21",
  icpIdentifier:
    "646f4d2d6fcb6fab5ba1547647526b666553467ecb5cb28c8d9ddf451c8f4c21",
  balanceE8s: 123456789010000n,
  principal: hardwareWalletPrincipal,
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
  principal: hardwareWalletPrincipal,
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
  (run: Subscriber<IcpAccountsStoreData>): (() => void) => {
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
