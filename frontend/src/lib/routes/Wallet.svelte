<script lang="ts">
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";
  import NnsWallet from "$lib/pages/NnsWallet.svelte";
  import SnsWallet from "$lib/pages/SnsWallet.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";

  export let accountIdentifier: string | undefined | null = undefined;

  layoutTitleStore.set($i18n.wallet.title);
</script>

{#if $isNnsUniverseStore}
  <NnsWallet {accountIdentifier} />
{:else}
  <SnsWallet {accountIdentifier} />
{/if}
