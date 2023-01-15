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
  import type { Principal } from "@dfinity/principal";
  import { projectsAccountsBalance } from "$lib/derived/projects-accounts-balance.derived";
  import { isNullish } from "$lib/utils/utils";
  import { loadSnsBalance } from "$lib/services/sns-accounts-balance.services";
  import { isNnsProject } from "$lib/utils/projects.utils";

  $: (async () =>
    await uncertifiedLoadSnsBalances({ summaries: $snsSummariesStore }))();

  let projectIdSelected = $snsProjectIdSelectedStore;

  const certifySnsBalance = async (snsProjectId: Principal) => {
    // Update Sns balance only when the selected project changes
    if (projectIdSelected.toText() === snsProjectId.toText()) {
      return;
    }

    projectIdSelected = snsProjectId;

    if (isNnsProject(projectIdSelected)) {
      return;
    }

    const projectAccountsBalance = $projectsAccountsBalance[projectIdSelected];

    // e.g. user has entered an unknown project ID in the browser url bar
    // Should not happen because user is redirect to Nns but never too sure
    if (isNullish(projectAccountsBalance)) {
      return;
    }

    // If data are already certified we do not have to refresh these to avoid to stress the network #performance
    if (projectAccountsBalance.certified) {
      return;
    }

    await loadSnsBalance({
      rootCanisterId: projectIdSelected,
      strategy: "update",
    });
  };

  $: (async () => await certifySnsBalance($snsProjectIdSelectedStore))();
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
