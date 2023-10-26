<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import {
    cancelPollAccounts,
    getAccountTransactions,
    loadBalance,
    pollAccounts,
  } from "$lib/services/icp-accounts.services";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import { busy, Island, Spinner } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { writable } from "svelte/store";
  import TransactionList from "$lib/components/accounts/TransactionList.svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import {
    accountName,
    findAccount,
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
  import { ICPToken, TokenAmount, isNullish, nonNullish } from "@dfinity/utils";
  import ReceiveButton from "$lib/components/accounts/ReceiveButton.svelte";
  import type { AccountIdentifierText } from "$lib/types/account";
  import WalletPageHeader from "$lib/components/accounts/WalletPageHeader.svelte";
  import WalletPageHeading from "$lib/components/accounts/WalletPageHeading.svelte";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
  import HardwareWalletListNeuronsButton from "$lib/components/accounts/HardwareWalletListNeuronsButton.svelte";
  import HardwareWalletShowActionButton from "$lib/components/accounts/HardwareWalletShowActionButton.svelte";
  import IcpWalletTransactions from "$lib/components/accounts/IcpWalletTransactions.svelte";

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);
  // TODO: debug
  // $: debugTransactions(transactions);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  export let accountIdentifier: string | undefined | null = undefined;

  const accountDidUpdate = async ({ account }: WalletStore) => {
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

  // We need an object to handle case where the identifier does not exist and the wallet page is loaded directly
  // First call: identifier is set, accounts store is empty, selectedAccount is undefined
  // Second call: identifier is set, accounts store is set, selectedAccount is still undefined
  $: selectedAccountStore.set({
    account: findAccount({
      identifier: accountIdentifier,
      accounts: $nnsAccountsListStore,
    }),
    neurons: [],
  });

  $: (async () => await accountDidUpdate($selectedAccountStore))();

  let showModal: "send" | undefined = undefined;

  // TODO(L2-581): Create WalletInfo component

  let disabled = false;
  $: disabled = isNullish($selectedAccountStore.account) || $busy;

  let name: string;
  $: name = accountName({
    account: $selectedAccountStore.account,
    mainName: $i18n.accounts.main,
  });

  let isHardwareWallet: boolean;
  $: isHardwareWallet = isAccountHardwareWallet($selectedAccountStore.account);
</script>

<TestIdWrapper testId="nns-wallet-component">
  <Island>
    <main class="legacy" data-tid="nns-wallet">
      <section>
        {#if $selectedAccountStore.account !== undefined}
          <WalletPageHeader
            universe={NNS_UNIVERSE}
            walletAddress={$selectedAccountStore.account.identifier}
          />
          <WalletPageHeading
            balance={TokenAmount.fromE8s({
              amount: $selectedAccountStore.account.balanceE8s,
              token: ICPToken,
            })}
            accountName={name}
            principal={isHardwareWallet
              ? $selectedAccountStore.account.principal
              : undefined}
          >
            {#if isHardwareWallet}
              <HardwareWalletListNeuronsButton />
              <HardwareWalletShowActionButton />
            {/if}
          </WalletPageHeading>

          <Separator spacing="none" />

          <IcpWalletTransactions />
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
        data-tid="new-transaction">{$i18n.accounts.send}</button
      >

      <ReceiveButton
        type="nns-receive"
        account={$selectedAccountStore.account}
      />
    </Footer>
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
