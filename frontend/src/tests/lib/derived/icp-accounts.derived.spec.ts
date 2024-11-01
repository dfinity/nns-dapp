import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountBalancesStore } from "$lib/stores/icp-account-balances.store";
import { icpAccountDetailsStore } from "$lib/stores/icp-account-details.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("icpAccountsStore", () => {
  const mainAccountIdentifier = "mainAccountIdentifier";
  const subAccountIdentifier = "subAccountIdentifier";
  const hardwareWalletAccountIdentifier = "hardwareWalletAccountIdentifier";

  const mainAccountBalance = 100_000_000n;
  const subAccountBalance = 200_000_000n;
  const hardwareWalletAccountBalance = 500_000_000n;

  const mainAccountPrincipal = principal(11);
  const hardwareWalletAccountPrincipal = principal(42);

  const subAccountName = "My subaccount";
  const hardwareWalletAccountName = "My Nano S";
  const subAccountArray = [0x54, 0x65, 0x76, 0x87];

  const hardwareWalletAccount: HardwareWalletAccountDetails = {
    principal: hardwareWalletAccountPrincipal,
    name: hardwareWalletAccountName,
    account_identifier: hardwareWalletAccountIdentifier,
  };

  const subAccount: SubAccountDetails = {
    name: subAccountName,
    sub_account: subAccountArray,
    account_identifier: subAccountIdentifier,
  };

  const accountDetails: AccountDetails = {
    principal: mainAccountPrincipal,
    account_identifier: mainAccountIdentifier,
    hardware_wallet_accounts: [hardwareWalletAccount],
    sub_accounts: [subAccount],
  };

  const accountDetailsData = {
    accountDetails,
    certified: true,
  };

  const setBalance = ({ accountIdentifier, balanceE8s, certified }) => {
    const mutableStore =
      icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore();
    mutableStore.setBalance({
      accountIdentifier,
      balanceE8s,
      certified,
    });
  };

  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
    icpAccountDetailsStore.resetForTesting();
    icpAccountBalancesStore.resetForTesting();
  });

  it("should be initialized to empty", () => {
    expect(get(icpAccountsStore)).toEqual({
      main: undefined,
      subAccounts: undefined,
      hardwareWallets: undefined,
    });
  });

  it("should derive main account and balance", () => {
    icpAccountDetailsStore.setForTesting({
      accountDetails: {
        ...accountDetails,
        sub_accounts: [],
        hardware_wallet_accounts: [],
      },
      certified: true,
    });

    setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: mainAccountBalance,
      certified: true,
    });

    expect(get(icpAccountsStore)).toEqual({
      main: {
        balanceUlps: mainAccountBalance,
        identifier: mainAccountIdentifier,
        principal: mainAccountPrincipal,
        type: "main",
      },
      subAccounts: [],
      hardwareWallets: [],
    });
  });

  it("should derive all accounts and balances", () => {
    icpAccountDetailsStore.setForTesting(accountDetailsData);

    setBalance({
      accountIdentifier: mainAccountIdentifier,
      balanceE8s: mainAccountBalance,
      certified: true,
    });

    setBalance({
      accountIdentifier: subAccountIdentifier,
      balanceE8s: subAccountBalance,
      certified: true,
    });

    setBalance({
      accountIdentifier: hardwareWalletAccountIdentifier,
      balanceE8s: hardwareWalletAccountBalance,
      certified: true,
    });

    expect(get(icpAccountsStore)).toEqual({
      main: {
        balanceUlps: mainAccountBalance,
        identifier: mainAccountIdentifier,
        principal: mainAccountPrincipal,
        type: "main",
      },
      subAccounts: [
        {
          balanceUlps: subAccountBalance,
          identifier: subAccountIdentifier,
          name: subAccountName,
          subAccount: subAccountArray,
          type: "subAccount",
        },
      ],
      hardwareWallets: [
        {
          balanceUlps: hardwareWalletAccountBalance,
          identifier: hardwareWalletAccountIdentifier,
          name: hardwareWalletAccountName,
          principal: hardwareWalletAccountPrincipal,
          type: "hardwareWallet",
        },
      ],
    });
  });
});
