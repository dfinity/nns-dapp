<script lang="ts">
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
  import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
  import { uncertifiedLoadSnsBalances } from "$lib/services/projects.services";
  import { snsSummariesStore } from "$lib/stores/sns.store";

  $: (async () =>
    await uncertifiedLoadSnsBalances({ summaries: $snsSummariesStore }))();
</script>

<main>
  {#if $isNnsProjectStore}
    <NnsAccounts />
  {:else if $snsProjectIdSelectedStore !== undefined}
    <SnsAccounts />
  {/if}
</main>

{#if $isNnsProjectStore}
  <NnsAccountsFooter />
{:else}
  <SnsAccountsFooter />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
