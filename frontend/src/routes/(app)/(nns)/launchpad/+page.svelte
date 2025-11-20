<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import Launchpad2 from "$lib/pages/Launchpad2.svelte";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { loadProposalsSnsCF } from "$lib/services/public/sns.services";
  import { loadSnsSwapCommitments } from "$lib/services/sns.services";
  import {
    isLoadingSnsProjectsStore,
    openSnsProposalsStore,
    snsProposalsStoreIsLoading,
  } from "$lib/stores/sns.store";

  loadIcpSwapTickers();
  $effect(() => {
    if ($authSignedInStore) {
      loadSnsSwapCommitments();
    }
  });
  $effect(() => {
    if ($snsProposalsStoreIsLoading) {
      loadProposalsSnsCF({ omitLargeFields: false });
    }
  });

  const snsProjects = $derived($snsProjectsActivePadStore);
  const openSnsProposals = $derived($openSnsProposalsStore);
</script>

<Launchpad2
  {snsProjects}
  {openSnsProposals}
  isLoading={$isLoadingSnsProjectsStore}
/>
