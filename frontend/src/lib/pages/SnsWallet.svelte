<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { Spinner, busy } from "@dfinity/gix-components";
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import SnsTransactionsList from "$lib/components/accounts/SnsTransactionsList.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { Island } from "@dfinity/gix-components";
  import Summary from "$lib/components/summary/Summary.svelte";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/sns/sns-selected-project.derived";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import IC_LOGO from "$lib/assets/icp.svg";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { loadSnsAccountTransactions } from "$lib/services/sns-transactions.services";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import IcrcAccountsObserver from "$lib/components/accounts/IcrcAccountsObserver.svelte";
  import type { AccountsObserverData } from "$lib/types/icrc.observer";
  import SnsWalletTransactionsObserver from "$lib/components/accounts/SnsWalletTransactionsObserver.svelte";

  let showModal: "send" | undefined = undefined;

  const onSnsProjectChanged = async (
    selectedProjectCanisterId: Principal | undefined
  ) => {
    if (selectedProjectCanisterId !== undefined) {
      // Reload accounts always.
      // Do not set to loading because we might use the account in the store.
      await syncSnsAccounts({ rootCanisterId: selectedProjectCanisterId });
    }
  };

  $: onSnsProjectChanged($snsOnlyProjectStore);

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  export let accountIdentifier: string | undefined | null = undefined;

  const load = () => {
    if (nonNullish(accountIdentifier)) {
      const selectedAccount = $snsProjectAccountsStore?.find(
        ({ identifier }) => identifier === accountIdentifier
      );

      selectedAccountStore.set({
        account: selectedAccount,
        neurons: [],
      });
    }
  };

  const reloadTransactions = async () => {
    if (
      isNullish($selectedAccountStore.account) ||
      isNullish($snsOnlyProjectStore)
    ) {
      return;
    }

    await loadSnsAccountTransactions({
      account: $selectedAccountStore.account,
      canisterId: $snsOnlyProjectStore,
    });
  };

  $: accountIdentifier, $snsProjectAccountsStore, load();

  let disabled = false;
  $: disabled = isNullish($selectedAccountStore.account) || $busy;

  let logo: string;
  $: logo = $selectedUniverseStore?.summary?.metadata.logo ?? IC_LOGO;

  let tokenSymbol: string | undefined;
  $: tokenSymbol = $selectedUniverseStore?.summary?.token.symbol;

  const reloadAccount = async () => {
    try {
      await Promise.all([
        nonNullish($snsOnlyProjectStore)
          ? syncSnsAccounts({ rootCanisterId: $snsOnlyProjectStore })
          : Promise.resolve(),
        reloadTransactions(),
      ]);

      // Apply reloaded values - balance - to UI
      load();
    } catch (err: unknown) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_reload, {
          $account_identifier: accountIdentifier ?? "",
        }),
        err,
      });
    }
  };

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($snsOnlyProjectStore)
    ? $tokensStore[$snsOnlyProjectStore.toText()]?.token
    : undefined;

  let accountsObserverData: AccountsObserverData | undefined;
  $: accountsObserverData =
    nonNullish($selectedAccountStore.account) &&
    nonNullish($snsProjectSelectedStore)
      ? {
          account: $selectedAccountStore.account,
          ledgerCanisterId:
            $snsProjectSelectedStore.summary.ledgerCanisterId.toText(),
        }
      : undefined;
</script>

<Island>
  <main class="legacy" data-tid="sns-wallet">
    <section>
      {#if nonNullish($selectedAccountStore.account) && nonNullish($snsOnlyProjectStore) && nonNullish(accountsObserverData)}
        <IcrcAccountsObserver data={accountsObserverData}>
          <Summary />

          <WalletSummary {token} />

          <Separator />

          <SnsWalletTransactionsObserver>
            <SnsTransactionsList
              rootCanisterId={$snsOnlyProjectStore}
              account={$selectedAccountStore.account}
              {token}
            />
          </SnsWalletTransactionsObserver>
        </IcrcAccountsObserver>
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  <Footer>
    <button
      class="primary"
      on:click={() => (showModal = "send")}
      {disabled}
      data-tid="open-new-sns-transaction">{$i18n.accounts.send}</button
    >

    <ReceiveButton
      type="sns-receive"
      account={$selectedAccountStore.account}
      reload={reloadAccount}
      testId="receive-sns"
    />
  </Footer>
</Island>

{#if showModal}
  <SnsTransactionModal
    on:nnsClose={() => (showModal = undefined)}
    selectedAccount={$selectedAccountStore.account}
    loadTransactions
  />
{/if}
