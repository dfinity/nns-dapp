<script lang="ts">
  import IcrcTokenWalletFooter from "$lib/components/accounts/IcrcTokenWalletFooter.svelte";
  import IcrcWalletPage from "$lib/components/accounts/IcrcWalletPage.svelte";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import NoTransactions from "$lib/components/accounts/NoTransactions.svelte";
  import SnsWalletDevTools from "$lib/components/experimental/SnsWalletDevTools.svelte";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
  import type { CanisterId } from "$lib/types/canister";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { nonNullish } from "@dfinity/utils";
  import { writable } from "svelte/store";

  type Props = {
    accountIdentifier: string | undefined | null;
  };
  const { accountIdentifier }: Props = $props();

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  const ledgerCanisterId: CanisterId | undefined = $derived(
    $snsProjectSelectedStore?.summary.ledgerCanisterId
  );
  const indexCanisterId: CanisterId | undefined = $derived(
    $snsProjectSelectedStore?.summary.indexCanisterId
  );
  const token = $derived(
    nonNullish(ledgerCanisterId)
      ? $tokensByLedgerCanisterIdStore[ledgerCanisterId.toText()]
      : undefined
  );

  let wallet: IcrcWalletPage;
  let transactions: IcrcWalletTransactionsList | undefined = $state();

  const reloadAccount = async () => await wallet?.reloadAccount?.();
  const reloadTransactions = () =>
    transactions?.reloadTransactions?.() ?? Promise.resolve();
</script>

<IcrcWalletPage
  testId="sns-wallet-component"
  {accountIdentifier}
  {token}
  {ledgerCanisterId}
  {indexCanisterId}
  {selectedAccountStore}
  bind:this={wallet}
  {reloadTransactions}
>
  <svelte:fragment slot="page-content">
    {#if nonNullish($selectedAccountStore.account) && nonNullish(ledgerCanisterId) && nonNullish(indexCanisterId)}
      <IcrcWalletTransactionsList
        account={$selectedAccountStore.account}
        {indexCanisterId}
        {ledgerCanisterId}
        {token}
        bind:this={transactions}
      />
    {:else}
      <NoTransactions />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer-actions">
    {#if nonNullish($selectedAccountStore.account) && nonNullish(token) && nonNullish(ledgerCanisterId)}
      <IcrcTokenWalletFooter
        {ledgerCanisterId}
        account={$selectedAccountStore.account}
        {token}
        {reloadAccount}
        {reloadTransactions}
      />
    {/if}
  </svelte:fragment>
</IcrcWalletPage>

{#if nonNullish(indexCanisterId) && nonNullish(ledgerCanisterId) && nonNullish(token)}
  <SnsWalletDevTools {indexCanisterId} {ledgerCanisterId} {token} />
{/if}
