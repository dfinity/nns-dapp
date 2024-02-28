import type {
  AccountDetails,
  HardwareWalletAccountDetails,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { icpAccountDetailsStore } from "$lib/stores/icp-account-details.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("icpAccountDetailsStore", () => {
  const hardwareWalletAccount: HardwareWalletAccountDetails = {
    principal: principal(43),
    name: "My Nano S",
    account_identifier: "hardwareWalletAccountIdentifier",
  };

  const subAccount: SubAccountDetails = {
    name: "My subaccount",
    sub_account: [54, 65, 76, 87],
    account_identifier: "subAccountIdentifier",
  };

  const accountDetails: AccountDetails = {
    principal: principal(10),
    account_identifier: "mainAccountIdentifier",
    hardware_wallet_accounts: [hardwareWalletAccount],
    sub_accounts: [subAccount],
  };

  const accountDetailsData = {
    accountDetails,
    certified: true,
  };

  beforeEach(() => {
    icpAccountDetailsStore.reset();
  });

  it("should be initialized to undefined", () => {
    expect(get(icpAccountDetailsStore)).toBeUndefined();
  });

  it("should set data", () => {
    icpAccountDetailsStore.set(accountDetailsData);

    expect(get(icpAccountDetailsStore)).toEqual(accountDetailsData);
  });

  it("should reset data", () => {
    icpAccountDetailsStore.set(accountDetailsData);

    expect(get(icpAccountDetailsStore)).toBeDefined();
    icpAccountDetailsStore.reset();
    expect(get(icpAccountDetailsStore)).toBeUndefined();
  });
});
