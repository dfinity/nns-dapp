<script lang="ts">
  import {
    isCkBTCUniverseStore,
    isNnsUniverseStore,
  } from "$lib/derived/selected-universe.derived";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NnsWallet from "$lib/pages/NnsWallet.svelte";
  import SnsWallet from "$lib/pages/SnsWallet.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";

  export let accountIdentifier: string | undefined | null = undefined;

  layoutTitleStore.set($i18n.wallet.title);
</script>

<TestIdWrapper testId="wallet-component">
  {#if $isNnsUniverseStore}
    <NnsWallet {accountIdentifier} />
  {:else if $isCkBTCUniverseStore}
    <CkBTCWallet {accountIdentifier} />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsWallet {accountIdentifier} />
  {/if}

  {#if $isCkBTCUniverseStore}
    <CkBTCAccountsModals />
  {:else}
    <AccountsModals />
  {/if}
</TestIdWrapper>
