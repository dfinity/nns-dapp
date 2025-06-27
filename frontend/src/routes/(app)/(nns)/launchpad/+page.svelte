<script lang="ts">
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import Launchpad from "$lib/pages/Launchpad.svelte";
  import Launchpad2 from "$lib/pages/Launchpad2.svelte";
  import { loadIcpSwapTickers } from "$lib/services/icp-swap.services";
  import { loadProposalsSnsCF } from "$lib/services/public/sns.services";
  import { loadSnsSwapCommitments } from "$lib/services/sns.services";
  import { ENABLE_LAUNCHPAD_REDESIGN } from "$lib/stores/feature-flags.store";
  import {
    openSnsProposalsStore,
    snsProposalsStoreIsLoading,
  } from "$lib/stores/sns.store";
  import { filterProjectsStatus } from "$lib/utils/projects.utils";
  import { SnsSwapLifecycle } from "@dfinity/sns";

  if ($ENABLE_LAUNCHPAD_REDESIGN) {
    loadIcpSwapTickers();
  }
  $effect(() => {
    if ($ENABLE_LAUNCHPAD_REDESIGN && $authSignedInStore) {
      loadSnsSwapCommitments();
    }
  });
  $effect(() => {
    if ($ENABLE_LAUNCHPAD_REDESIGN && $snsProposalsStoreIsLoading) {
      loadProposalsSnsCF({ omitLargeFields: false });
    }
  });

  const snsProjects = $derived($snsProjectsActivePadStore);
  const openSnsProposals = $derived($openSnsProposalsStore);
  const adoptedSnsProposals = $derived(
    filterProjectsStatus({
      swapLifecycle: SnsSwapLifecycle.Open,
      projects: snsProjects,
    })
  );
</script>

{#if $ENABLE_LAUNCHPAD_REDESIGN}
  <Launchpad2 {snsProjects} {openSnsProposals} {adoptedSnsProposals} />
{:else}
  <Launchpad />
{/if}
