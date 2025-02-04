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

  it("should be initialized to undefined", () => {
    expect(get(icpAccountDetailsStore)).toBeUndefined();
  });

  it("should set data", () => {
    const singleMutationStore = icpAccountDetailsStore.getSingleMutationStore();

    expect(get(icpAccountDetailsStore)).toBeUndefined();
    singleMutationStore.set({ data: accountDetailsData, certified: true });

    expect(get(icpAccountDetailsStore)).toEqual(accountDetailsData);
  });

  it("should reset data", () => {
    icpAccountDetailsStore.setForTesting(accountDetailsData);

    expect(get(icpAccountDetailsStore)).toBeDefined();
    icpAccountDetailsStore.resetForTesting();
    expect(get(icpAccountDetailsStore)).toBeUndefined();
  });

  it("should not override new uncertified data with old certified data", () => {
    const oldDetails = accountDetails;
    const newDetails = {
      ...accountDetails,
      principal: principal(11),
    };

    const mutation1 = icpAccountDetailsStore.getSingleMutationStore();
    mutation1.set({
      data: { accountDetails: oldDetails, certified: false },
      certified: false,
    });

    expect(get(icpAccountDetailsStore)).toEqual({
      accountDetails: oldDetails,
      certified: false,
    });

    const mutation2 = icpAccountDetailsStore.getSingleMutationStore();
    mutation2.set({
      data: { accountDetails: newDetails, certified: false },
      certified: false,
    });

    expect(get(icpAccountDetailsStore)).toEqual({
      accountDetails: newDetails,
      certified: false,
    });

    // When the update response from mutation 1 comes, it should not override the newer data.
    mutation1.set({
      data: { accountDetails: oldDetails, certified: true },
      certified: true,
    });
    expect(get(icpAccountDetailsStore)).toEqual({
      accountDetails: newDetails,
      certified: false,
    });
  });
});
