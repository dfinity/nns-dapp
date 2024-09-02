<script lang="ts">
  import IcrcTokenWalletFooter from "$lib/components/accounts/IcrcTokenWalletFooter.svelte";
  import IcrcWalletPage from "$lib/components/accounts/IcrcWalletPage.svelte";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import NoTransactions from "$lib/components/accounts/NoTransactions.svelte";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { tokensByLedgerCanisterIdStore } from "$lib/derived/tokens.derived";
  import type { CanisterId } from "$lib/types/canister";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { WalletStore } from "$lib/types/wallet.context";
  import { nonNullish } from "@dfinity/utils";
  import { writable } from "svelte/store";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  let ledgerCanisterId: CanisterId | undefined;
  $: ledgerCanisterId = $snsProjectSelectedStore?.summary.ledgerCanisterId;

  let indexCanisterId: CanisterId | undefined;
  $: indexCanisterId = $snsProjectSelectedStore?.summary.indexCanisterId;

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish(ledgerCanisterId)
    ? $tokensByLedgerCanisterIdStore[ledgerCanisterId.toText()]
    : undefined;

  let transactions: IcrcWalletTransactionsList;
  let wallet: IcrcWalletPage;

  const reloadAccount = async () => await wallet.reloadAccount?.();
  const reloadTransactions = () => transactions?.reloadTransactions?.();
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
