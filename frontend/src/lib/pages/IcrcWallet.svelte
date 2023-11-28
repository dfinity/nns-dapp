<script lang="ts">
  import {
    selectedCkBTCUniverseIdStore,
    selectedIcrcTokenUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import { nonNullish } from "@dfinity/utils";
  import WalletPage from "$lib/components/accounts/WalletPage.svelte";
  import { writable } from "svelte/store";
  import type { WalletStore } from "$lib/types/wallet.context";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import type { CanisterId } from "$lib/types/canister";
  import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { tokensStore } from "$lib/stores/tokens.store";

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
    ? $tokensStore[$selectedIcrcTokenUniverseIdStore.toText()]?.token
    : undefined;
</script>

<WalletPage
  {accountIdentifier}
  {token}
  selectedUniverseId={$selectedIcrcTokenUniverseIdStore}
  {selectedAccountStore}
>
  <svelte:fragment slot="page-content">
    {#if nonNullish($selectedAccountStore.account) && nonNullish($selectedCkBTCUniverseIdStore) && nonNullish(indexCanisterId)}
      <IcrcWalletTransactionsList
        account={$selectedAccountStore.account}
        {indexCanisterId}
        universeId={$selectedCkBTCUniverseIdStore}
        {token}
      />
    {/if}
  </svelte:fragment>
</WalletPage>
