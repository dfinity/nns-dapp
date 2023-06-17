<script lang="ts">
  import Projects from "$lib/components/launchpad/Projects.svelte";
  import Proposals from "$lib/components/launchpad/Proposals.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import {
    snsProjectsAdoptedStore,
    snsProjectsCommittedStore,
  } from "$lib/derived/sns/sns-projects.derived";
  import { loadSnsSwapCommitments } from "$lib/services/sns.services";
  import { authStore } from "$lib/stores/auth.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  const loadSnsSale = async () => {
    if (!$authSignedInStore) {
      return;
    }
    await loadSnsSwapCommitments();
  };
  $: $authStore.identity, (async () => await loadSnsSale())();

  let showCommitted = false;
  $: showCommitted = $snsProjectsCommittedStore.length > 0;

  let showAdopted = false;
  $: showAdopted = $snsProjectsAdoptedStore.length > 0;
</script>

<main data-tid="launchpad-component">
  <h2>{$i18n.sns_launchpad.open_projects}</h2>
  <Projects testId="open-projects" status={SnsSwapLifecycle.Open} />

  {#if showAdopted}
    <h2>{$i18n.sns_launchpad.upcoming_projects}</h2>
    <Projects testId="upcoming-projects" status={SnsSwapLifecycle.Adopted} />
  {/if}

  {#if showCommitted}
    <h2>{$i18n.sns_launchpad.committed_projects}</h2>
    <Projects testId="committed-projects" status={SnsSwapLifecycle.Committed} />
  {/if}

  <h2>{$i18n.sns_launchpad.proposals}</h2>
  <Proposals />
</main>

<style lang="scss">
  h2 {
    margin: var(--padding-8x) 0 var(--padding-3x);

    &:first-of-type {
      margin-top: var(--padding);
    }
  }
</style>
