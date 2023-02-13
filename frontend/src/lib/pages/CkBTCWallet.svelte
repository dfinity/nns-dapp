<script lang="ts">
  import { busy, Island, Spinner } from "@dfinity/gix-components";
  import Summary from "$lib/components/summary/Summary.svelte";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { writable } from "svelte/store";
  import {
    WALLET_CONTEXT_KEY,
    type CkBTCWalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { setContext } from "svelte/internal";
  import { findAccount, hasAccounts } from "$lib/utils/accounts.utils";
  import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import {
    loadCkBTCAccounts,
    syncCkBTCAccounts,
  } from "$lib/services/ckbtc-accounts.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import { ENABLE_CKBTC_RECEIVE } from "$lib/constants/environment.constants";
  import CkBTCWalletFooter from "$lib/components/accounts/CkBTCWalletFooter.svelte";
  import CkBTCWalletModals from "$lib/modals/accounts/CkBTCWalletModals.svelte";

  export let accountIdentifier: string | undefined | null = undefined;

  let showNewTransactionModal = false;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);

  // e.g. is called from "Receive" modal after minter.update_balance was successfully executed
  const reloadAccount = async () => {
    await loadCkBTCAccounts({});
    await loadAccount();
  };

  setContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
    reloadAccount,
  });

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  const setSelectedAccount = () => {
    selectedAccountStore.set({
      account: findAccount({
        identifier: accountIdentifier,
        accounts: $ckBTCAccountsStore.accounts,
      }),
      neurons: [],
    });
  };

  const onTransferReloadSelectedAccount = () => {
    setSelectedAccount();
    showNewTransactionModal = false;
  };

  const loadAccount = async (): Promise<{
    state: "loaded" | "not_found" | "unknown";
  }> => {
    setSelectedAccount();

    // We found an account in store for the provided account identifier, all data are set
    if (nonNullish($selectedAccountStore.account)) {
      return { state: "loaded" };
    }

    // Accounts are loaded in store but no account identifier is matching
    if (hasAccounts($ckBTCAccountsStore.accounts)) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
      return { state: "not_found" };
    }

    return { state: "unknown" };
  };

  let loaded = false;

  const loadData = async () => {
    // This will display a spinner each time we search and load an account
    // It will also re-create a new component for the list of transactions which per extension will trigger fetching those
    loaded = false;

    const { state } = await loadAccount();

    // The account was loaded or was not found even though accounts are already loaded in store
    if (state !== "unknown") {
      loaded = true;
      return;
    }

    // Maybe the accounts were just not loaded yet in store, so we try to load the accounts in store
    await syncCkBTCAccounts({});

    // And finally try to set the account again
    await loadAccount();

    loaded = true;
  };

  $: accountIdentifier, (async () => await loadData())();

  let canMakeTransactions = false;
  $: canMakeTransactions =
    hasAccounts($ckBTCAccountsStore.accounts) &&
    nonNullish($ckBTCTokenFeeStore) &&
    nonNullish($ckBTCTokenStore);
</script>

<Island>
  <main class="legacy" data-tid="ckbtc-wallet">
    <section>
      {#if loaded}
        <Summary />

        <WalletSummary />

        <Separator />

        {#if nonNullish($selectedAccountStore.account)}
          <CkBTCTransactionsList account={$selectedAccountStore.account} />
        {/if}
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  {#if canMakeTransactions}
    <Footer columns={ENABLE_CKBTC_RECEIVE ? 2 : 1}>
      {#if ENABLE_CKBTC_RECEIVE}
        <CkBTCWalletFooter />
      {/if}

      <button
        class="primary"
        on:click={() => (showNewTransactionModal = true)}
        disabled={isNullish($selectedAccountStore.account) || $busy}
        data-tid="open-new-ckbtc-transaction"
        >{$i18n.accounts.new_transaction}</button
      >
    </Footer>
  {/if}
</Island>

<CkBTCWalletModals />

{#if showNewTransactionModal && nonNullish($ckBTCTokenStore) && nonNullish($ckBTCTokenFeeStore)}
  <CkBTCTransactionModal
    on:nnsClose={() => (showNewTransactionModal = false)}
    on:nnsTransfer={onTransferReloadSelectedAccount}
    selectedAccount={$selectedAccountStore.account}
    loadTransactions
    token={$ckBTCTokenStore.token}
    transactionFee={$ckBTCTokenFeeStore}
  />
{/if}
