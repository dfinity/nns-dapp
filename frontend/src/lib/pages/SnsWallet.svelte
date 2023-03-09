<script lang="ts">
  import { Spinner, busy } from "@dfinity/gix-components";
  import { onDestroy, setContext } from "svelte";
  import { writable, type Unsubscriber } from "svelte/store";
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
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import IC_LOGO from "$lib/assets/icp.svg";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { loadSnsAccountTransactions } from "$lib/services/sns-transactions.services";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { toastsError } from "$lib/stores/toasts.store";

  let showModal: "send" | "receive" | undefined = undefined;

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // Reload accounts always.
        // Do not set to loading because we might use the account in the store.
        await syncSnsAccounts({ rootCanisterId: selectedProjectCanisterId });
      }
    }
  );

  onDestroy(unsubscribe);

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
</script>

<Island>
  <main class="legacy" data-tid="sns-wallet">
    <section>
      {#if $selectedAccountStore.account !== undefined && $snsOnlyProjectStore !== undefined}
        <Summary />

        <WalletSummary />

        <Separator />

        <SnsTransactionsList
          rootCanisterId={$snsOnlyProjectStore}
          account={$selectedAccountStore.account}
        />
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>

  <Footer columns={2}>
    <button
      class="primary"
      on:click={() => (showModal = "send")}
      {disabled}
      data-tid="open-new-sns-transaction">{$i18n.accounts.send}</button
    >

    <button
      class="secondary"
      on:click={() => (showModal = "receive")}
      disabled={disabled || isNullish(tokenSymbol)}
      data-tid="receive-sns">{$i18n.ckbtc.receive}</button
    >
  </Footer>
</Island>

{#if showModal}
  <SnsTransactionModal
    on:nnsClose={() => (showModal = undefined)}
    selectedAccount={$selectedAccountStore.account}
    loadTransactions
  />
{/if}

<!-- For TS - action button is disabled anyway if account is undefined and token not defined -->
{#if showModal === "receive" && nonNullish($selectedAccountStore.account) && nonNullish(tokenSymbol)}
  <ReceiveModal
    account={$selectedAccountStore.account}
    on:nnsClose={() => (showModal = undefined)}
    qrCodeLabel={$i18n.wallet.qrcode_aria_label_icp}
    {logo}
    logoArialLabel={$i18n.core.icp}
    {reloadAccount}
  >
    <svelte:fragment slot="title"
      >{replacePlaceholders($i18n.wallet.sns_receive_note_title, {
        $tokenSymbol: tokenSymbol,
      })}</svelte:fragment
    >
    <svelte:fragment slot="description"
      >{replacePlaceholders($i18n.wallet.sns_receive_note_text, {
        $tokenSymbol: tokenSymbol,
      })}</svelte:fragment
    >
  </ReceiveModal>
{/if}
