import type { IcpAccountsStoreData } from "$lib/derived/icp-accounts.derived";
import { icpAccountBalancesStore } from "$lib/stores/icp-account-balances.store";
import { icpAccountDetailsStore } from "$lib/stores/icp-account-details.store";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

export const testAccountsModal = async ({
  result,
  testId,
}: {
  result: RenderResult<SvelteComponent>;
  testId: string;
}) => {
  const { container, getByTestId } = result;

  await waitFor(() => expect(getByTestId(testId)).not.toBeNull());

  const button = getByTestId(testId) as HTMLButtonElement;

  await fireEvent.click(button);

  await waitFor(() =>
    expect(container.querySelector("div.modal")).not.toBeNull()
  );
};

export const selectSegmentBTC = async (container: HTMLElement) => {
  const button = container.querySelector(
    "div.segment-button:nth-of-type(3) button"
  ) as HTMLButtonElement;
  expect(button).not.toBeNull();

  await fireEvent.click(button);
};

export const setAccountsForTesting = ({
  main,
  subAccounts = [],
  hardwareWallets = [],
  certified = false,
}: IcpAccountsStoreData & {
  certified?: boolean;
}) => {
  icpAccountDetailsStore.setForTesting({
    accountDetails: {
      principal: main.principal,
      account_identifier: main.identifier,
      hardware_wallet_accounts: hardwareWallets.map((icpAccount) => ({
        principal: icpAccount.principal,
        name: icpAccount.name,
        account_identifier: icpAccount.identifier,
      })),
      sub_accounts: subAccounts.map((icpAccount) => ({
        name: icpAccount.name,
        sub_account: icpAccount.subAccount,
        account_identifier: icpAccount.identifier,
      })),
    },
    certified,
  });

  const setBalance = ({
    accountIdentifier,
    balanceE8s,
  }: {
    accountIdentifier: string;
    balanceE8s: bigint;
  }) => {
    const mutableStore =
      icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore(
        certified ? "update" : "query"
      );
    mutableStore.setBalance({
      accountIdentifier,
      balanceE8s,
      certified,
    });
  };

  setBalance({
    accountIdentifier: main.identifier,
    balanceE8s: main.balanceUlps,
  });
  subAccounts.forEach((icpAccount) => {
    setBalance({
      accountIdentifier: icpAccount.identifier,
      balanceE8s: icpAccount.balanceUlps,
    });
  });
  hardwareWallets.forEach((icpAccount) => {
    setBalance({
      accountIdentifier: icpAccount.identifier,
      balanceE8s: icpAccount.balanceUlps,
    });
  });
};

export const setAccountBalanceForTesting = ({
  accountIdentifier,
  balanceE8s,
}: {
  accountIdentifier: string;
  balanceE8s: bigint;
}) => {
  const mutableStore =
    icpAccountBalancesStore.getSingleMutationIcpAccountBalancesStore();
  mutableStore.setBalance({
    accountIdentifier,
    balanceE8s,
    certified: true,
  });
};

export const resetAccountsForTesting = () => {
  icpAccountDetailsStore.resetForTesting();
  icpAccountBalancesStore.resetForTesting();
};
