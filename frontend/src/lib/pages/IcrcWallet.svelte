<script lang="ts">
  import { selectedIcrcTokenUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { nonNullish } from "@dfinity/utils";
  import IcrcWalletPage from "$lib/components/accounts/IcrcWalletPage.svelte";
  import { writable } from "svelte/store";
  import type { WalletStore } from "$lib/types/wallet.context";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import type { CanisterId } from "$lib/types/canister";
  import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { tokensStore } from "$lib/stores/tokens.store";
  import IcrcTokenWalletFooter from "$lib/components/accounts/IcrcTokenWalletFooter.svelte";

  export let accountIdentifier: string | undefined | null = undefined;

  let wallet: IcrcWalletPage;

  // e.g. when a function such as a transfer is called and which also reload the data and populate the stores after execution
  const reloadAccount = () => {
    wallet.setSelectedAccount();
  };

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
    ? $tokensStore[$selectedIcrcTokenUniverseIdStore.toText()]?.token
    : undefined;

  let transactions: IcrcWalletTransactionsList;
  const reloadTransactions = () => transactions?.reloadTransactions?.();
</script>

<IcrcWalletPage
  testId="icrc-wallet-component"
  {accountIdentifier}
  {token}
  selectedUniverseId={$selectedIcrcTokenUniverseIdStore}
  {selectedAccountStore}
  bind:this={wallet}
  {reloadTransactions}
>
  <svelte:fragment slot="page-content">
    {#if nonNullish($selectedAccountStore.account) && nonNullish($selectedIcrcTokenUniverseIdStore) && nonNullish(indexCanisterId)}
      <IcrcWalletTransactionsList
        account={$selectedAccountStore.account}
        {indexCanisterId}
        universeId={$selectedIcrcTokenUniverseIdStore}
        {token}
        bind:this={transactions}
      />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer-actions">
    {#if nonNullish($selectedAccountStore.account) && nonNullish(token) && nonNullish($selectedIcrcTokenUniverseIdStore)}
      <IcrcTokenWalletFooter
        universeId={$selectedIcrcTokenUniverseIdStore}
        account={$selectedAccountStore.account}
        reloadSourceAccount={reloadAccount}
        {token}
        {reloadAccount}
      />
    {/if}
  </svelte:fragment>
</IcrcWalletPage>
