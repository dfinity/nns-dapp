<script lang="ts">
  import {
    isCkBTCUniverseStore,
    isNnsUniverseStore,
  } from "$lib/derived/selected-universe.derived";
  import NnsWallet from "$lib/pages/NnsWallet.svelte";
  import SnsWallet from "$lib/pages/SnsWallet.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "$lib/utils/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";

  export let accountIdentifier: string | undefined | null = undefined;

  layoutTitleStore.set($i18n.wallet.title);
</script>

{#if $isNnsUniverseStore}
  <NnsWallet {accountIdentifier} />
{:else if $isCkBTCUniverseStore}
  <CkBTCWallet {accountIdentifier} />
{:else if nonNullish($snsProjectSelectedStore)}
  <SnsWallet {accountIdentifier} />
{/if}
