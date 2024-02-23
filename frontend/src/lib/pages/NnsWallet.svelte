<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import type { Account } from "$lib/types/account";
  import { onDestroy, setContext } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import {
    cancelPollAccounts,
    getAccountTransactions,
    loadBalance,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { Island, Spinner } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { writable, type Readable } from "svelte/store";
  import TransactionList from "$lib/components/accounts/TransactionList.svelte";
  import NoTransactions from "$lib/components/accounts/NoTransactions.svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import {
    accountName,
    findAccountOrDefaultToMain,
    isAccountHardwareWallet,
  } from "$lib/utils/accounts.utils";
  import {
    debugSelectedAccountStore,
    debugTransactions,
  } from "$lib/derived/debug.derived";
  import IcpTransactionModal from "$lib/modals/accounts/IcpTransactionModal.svelte";
  import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { pageStore } from "$lib/derived/page.derived";
  import Separator from "$lib/components/ui/Separator.svelte";
  import WalletModals from "$lib/modals/accounts/WalletModals.svelte";
  import { ICPToken, TokenAmountV2, nonNullish } from "@dfinity/utils";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import type { AccountIdentifierText } from "$lib/types/account";
  import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
  import WalletPageHeading from "$lib/components/accounts/WalletPageHeading.svelte";
  import HardwareWalletListNeuronsButton from "$lib/components/accounts/HardwareWalletListNeuronsButton.svelte";
  import HardwareWalletShowActionButton from "$lib/components/accounts/HardwareWalletShowActionButton.svelte";
  import RenameSubAccountButton from "$lib/components/accounts/RenameSubAccountButton.svelte";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import IC_LOGO from "$lib/assets/icp.svg";
  import {
    loadIcpAccountNextTransactions,
    loadIcpAccountTransactions,
  } from "$lib/services/icp-transactions.services";
  import { ENABLE_ICP_INDEX } from "$lib/stores/feature-flags.store";
  import type { UiTransaction } from "$lib/types/transaction";
  import {
    icpTransactionsStore,
    type IcpTransactionsStoreData,
  } from "$lib/stores/icp-transactions.store";
  import {
    mapIcpTransaction,
    mapToSelfTransactions,
    sortTransactionsByTimestamp,
  } from "$lib/utils/icp-transactions.utils";
  import UiTransactionsList from "$lib/components/accounts/UiTransactionsList.svelte";
  import { neuronAccountsStore } from "$lib/stores/neurons.store";
  import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { listNeurons } from "$lib/services/neurons.services";

  $: if ($authSignedInStore) {
    pollAccounts();
    if ($ENABLE_ICP_INDEX) {
      listNeurons();
    }
  }

  onDestroy(() => {
    cancelPollAccounts();
  });

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  let loadingTransactions = false;
  let transactions: Transaction[] | undefined;
  // Used to identify transactions related to a Swap.
  let swapCanisterAccountsStore: Readable<Set<string>> | undefined = undefined;
  let completedTransactions = false;
  $: completedTransactions = getCompletedFromStore({
    account: $selectedAccountStore.account,
    transactionsStore: $icpTransactionsStore,
  });
  const getCompletedFromStore = ({
    account,
    transactionsStore,
  }: {
    account: Account | undefined;
    transactionsStore: IcpTransactionsStoreData;
  }): boolean => {
    if (
      nonNullish(account) &&
      nonNullish(transactionsStore[account.identifier])
    ) {
      return transactionsStore[account.identifier].completed;
    }
    return false;
  };
  let uiTransactions: UiTransaction[] | undefined;
  $: uiTransactions = makeUiTransactions({
    account: $selectedAccountStore.account,
    transactionsStore: $icpTransactionsStore,
    swapCanisterAccounts: $swapCanisterAccountsStore ?? new Set(),
    neuronAccounts: $neuronAccountsStore,
  });
  const makeUiTransactions = ({
    account,
    transactionsStore,
    swapCanisterAccounts,
    neuronAccounts,
  }: {
    account: Account | undefined;
    transactionsStore: IcpTransactionsStoreData;
    swapCanisterAccounts: Set<string>;
    neuronAccounts: Set<string>;
  }): UiTransaction[] | undefined => {
    if (
      nonNullish(account) &&
      nonNullish(transactionsStore[account.identifier])
    ) {
      return mapToSelfTransactions(
        sortTransactionsByTimestamp(
          transactionsStore[account.identifier].transactions
        )
      )
        .map(({ transaction, toSelfTransaction }) =>
          mapIcpTransaction({
            accountIdentifier: account.identifier,
            transaction,
            toSelfTransaction,
            neuronAccounts,
            swapCanisterAccounts,
            i18n: $i18n,
          })
        )
        .filter(nonNullish);
    }
  };

  const reloadTransactions = (
    accountIdentifier: AccountIdentifierText
  ): Promise<void> => {
    if ($ENABLE_ICP_INDEX) {
      return loadIcpAccountTransactions({ accountIdentifier });
    }
    return getAccountTransactions({
      accountIdentifier: accountIdentifier,
      onLoad: ({ accountIdentifier, transactions: loadedTransactions }) => {
        // avoid using outdated transactions
        if (accountIdentifier !== $selectedAccountStore.account?.identifier) {
          return;
        }

        transactions = loadedTransactions;
      },
    });
  };

  const loadNextTransactions = async () => {
    if (nonNullish($selectedAccountStore.account)) {
      loadingTransactions = true;
      await loadIcpAccountNextTransactions(
        $selectedAccountStore.account.identifier
      );
      loadingTransactions = false;
    }
  };

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);
  $: debugTransactions(transactions);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  export let accountIdentifier: string | undefined | null = undefined;

  const accountDidUpdate = async ({ account }: WalletStore) => {
    if (account !== undefined) {
      await reloadTransactions(account.identifier);
      return;
    }

    // handle unknown accountIdentifier from URL
    if (
      account === undefined &&
      $icpAccountsStore.main !== undefined &&
      $pageStore.path === AppPath.Wallet
    ) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
    }
  };

  const setSelectedAccount = ({
    identifier,
    accounts,
  }: {
    identifier: string | undefined | null;
    accounts: Account[];
  }) => {
    const account = findAccountOrDefaultToMain({
      identifier,
      accounts,
    });
    if (nonNullish(account)) {
      // The accounts from the II identity have no principal at the moment.
      const accountPrincipal =
        account.principal ?? $authStore.identity?.getPrincipal();
      // Set the swapCanistersStore only once we have an account.
      swapCanisterAccountsStore =
        createSwapCanisterAccountsStore(accountPrincipal);
    }
    selectedAccountStore.set({
      account,
      neurons: [],
    });
  };

  // We need an object to handle case where the identifier does not exist and the wallet page is loaded directly
  // First call: identifier is set, accounts store is empty, selectedAccount is undefined
  // Second call: identifier is set, accounts store is set, selectedAccount is still undefined
  $: setSelectedAccount({
    identifier: accountIdentifier,
    accounts: $nnsAccountsListStore,
  });

  $: (async () => await accountDidUpdate($selectedAccountStore))();

  let showModal: "send" | undefined = undefined;

  // TODO(L2-581): Create WalletInfo component

  const reloadAccount = async () => {
    try {
      if (nonNullish($selectedAccountStore.account)) {
        await Promise.all([
          loadBalance({
            accountIdentifier: $selectedAccountStore.account.identifier,
          }),
          reloadTransactions($selectedAccountStore.account.identifier),
        ]);
      }
    } catch (err: unknown) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_reload, {
          $account_identifier: accountIdentifier ?? "",
        }),
        err,
      });
    }
  };

  let name: string;
  $: name = accountName({
    account: $selectedAccountStore.account,
    mainName: $i18n.accounts.main,
  });

  let isHardwareWallet: boolean;
  $: isHardwareWallet = isAccountHardwareWallet($selectedAccountStore.account);

  let isSubaccount: boolean;
  $: isSubaccount = $selectedAccountStore.account?.type === "subAccount";
</script>

<TestIdWrapper testId="nns-wallet-component">
  <Island>
    <main class="legacy" data-tid="nns-wallet">
      <section>
        {#if !$authSignedInStore || $selectedAccountStore.account !== undefined}
          <WalletPageHeader
            universe={$nnsUniverseStore}
            walletAddress={$selectedAccountStore.account?.identifier}
          />
          <WalletPageHeading
            balance={nonNullish($selectedAccountStore.account)
              ? TokenAmountV2.fromUlps({
                  amount: $selectedAccountStore.account.balanceUlps,
                  token: ICPToken,
                })
              : undefined}
            accountName={name}
            principal={isHardwareWallet
              ? $selectedAccountStore.account?.principal
              : undefined}
          >
            {#if isHardwareWallet}
              <HardwareWalletListNeuronsButton />
              <HardwareWalletShowActionButton />
            {:else if isSubaccount}
              <RenameSubAccountButton />
            {/if}
            <SignInGuard />
          </WalletPageHeading>

          <Separator spacing="none" />

          {#if $selectedAccountStore.account !== undefined}
            {#if $ENABLE_ICP_INDEX}
              <UiTransactionsList
                on:nnsIntersect={loadNextTransactions}
                transactions={uiTransactions ?? []}
                loading={loadingTransactions}
                completed={completedTransactions}
              />
            {:else}
              <TransactionList {transactions} />
            {/if}
          {:else}
            <NoTransactions />
          {/if}
        {:else}
          <Spinner />
        {/if}
      </section>
    </main>

    {#if nonNullish($selectedAccountStore.account)}
      <Footer>
        <button
          class="primary"
          on:click={() => (showModal = "send")}
          data-tid="new-transaction">{$i18n.accounts.send}</button
        >

        <ReceiveButton
          type="nns-receive"
          account={$selectedAccountStore.account}
          reload={reloadAccount}
          logo={IC_LOGO}
        />
      </Footer>
    {/if}
  </Island>

  <WalletModals />

  {#if showModal === "send"}
    <IcpTransactionModal
      on:nnsClose={() => (showModal = undefined)}
      selectedAccount={$selectedAccountStore.account}
    />
  {/if}
</TestIdWrapper>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }
</style>
