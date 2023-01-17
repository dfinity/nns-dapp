<script lang="ts">
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import {
    isNnsProjectStore,
    snsProjectIdSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
  import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
  import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
  import {
    committedProjectsStore,
    type SnsFullProject,
  } from "$lib/derived/projects.derived";
  import { isNullish } from "$lib/utils/utils";

  // Selected project ID on mount is excluded from load accounts balances. See documentation.
  let projectIdSelected = $snsProjectIdSelectedStore;

  let loadSnsAccountsBalancesRequested = false;

  const loadSnsAccountsBalances = async (
    projects: SnsFullProject[] | undefined
  ) => {
    // We start when the projects are fetched
    if (isNullish(projects) || projects.length === 0) {
      return;
    }

    // We trigger the loading of the Sns Accounts Balances only once
    if (loadSnsAccountsBalancesRequested) {
      return;
    }

    loadSnsAccountsBalancesRequested = true;

    await uncertifiedLoadSnsAccountsBalances({
      rootCanisterIds: projects.map(({ rootCanisterId }) => rootCanisterId),
      excludeRootCanisterIds: [projectIdSelected.toText()],
    });
  };

  $: (async () => await loadSnsAccountsBalances($committedProjectsStore))();
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
