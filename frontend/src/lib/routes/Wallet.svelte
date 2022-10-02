<script lang="ts">
  import { isNnsProjectStore } from "../derived/selected-project.derived";
  import NnsWallet from "../pages/NnsWallet.svelte";
  import SnsWallet from "../pages/SnsWallet.svelte";
</script>

{#if $isNnsProjectStore}
  <NnsWallet />
{:else}
  <SnsWallet />
{/if}
