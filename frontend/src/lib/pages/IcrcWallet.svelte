<script lang="ts">
  import IcrcTokenWalletFooter from "$lib/components/accounts/IcrcTokenWalletFooter.svelte";
  import IcrcWalletPage from "$lib/components/accounts/IcrcWalletPage.svelte";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import NoTransactions from "$lib/components/accounts/NoTransactions.svelte";
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
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

  let indexCanisterId: CanisterId | undefined;
  $: indexCanisterId = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $icrcCanistersStore[$selectedIcrcTokenUniverseIdStore.toText()]
        ?.indexCanisterId
    : undefined;

  let token: IcrcTokenMetadata | undefined;
  $: token = nonNullish($selectedIcrcTokenUniverseIdStore)
    ? $tokensByUniverseIdStore[$selectedIcrcTokenUniverseIdStore.toText()]
    : undefined;

  let transactions: IcrcWalletTransactionsList;
  let wallet: IcrcWalletPage;

  const reloadAccount = async () => await wallet.reloadAccount?.();
  const reloadTransactions = () => transactions?.reloadTransactions?.();
</script>

<IcrcWalletPage
  testId="icrc-wallet-component"
  {accountIdentifier}
  {token}
  ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
  {selectedAccountStore}
  bind:this={wallet}
  {reloadTransactions}
>
  <svelte:fragment slot="page-content">
    {#if nonNullish($selectedAccountStore.account) && nonNullish($selectedIcrcTokenUniverseIdStore) && nonNullish(indexCanisterId)}
      <IcrcWalletTransactionsList
        account={$selectedAccountStore.account}
        {indexCanisterId}
        ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
        {token}
        bind:this={transactions}
      />
    {:else}
      <NoTransactions />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer-actions">
    {#if nonNullish($selectedAccountStore.account) && nonNullish(token) && nonNullish($selectedIcrcTokenUniverseIdStore)}
      <IcrcTokenWalletFooter
        ledgerCanisterId={$selectedIcrcTokenUniverseIdStore}
        account={$selectedAccountStore.account}
        {token}
        {reloadAccount}
        {reloadTransactions}
      />
    {/if}
  </svelte:fragment>
</IcrcWalletPage>
