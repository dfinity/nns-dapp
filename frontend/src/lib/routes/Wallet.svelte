<script lang="ts">
  import { isNnsProjectStore } from "$lib/derived/selected-project.derived";
  import NnsWallet from "$lib/pages/NnsWallet.svelte";
  import SnsWallet from "$lib/pages/SnsWallet.svelte";

  export let accountIdentifier: string | undefined | null = undefined;
</script>

{#if $isNnsProjectStore}
  <NnsWallet {accountIdentifier} />
{:else}
  <SnsWallet {accountIdentifier} />
{/if}
