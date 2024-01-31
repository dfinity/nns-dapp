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
  <div class="open-projects">
    <h2>{$i18n.sns_launchpad.open_projects}</h2>
    <Projects testId="open-projects" status={SnsSwapLifecycle.Open} />
  </div>

  {#if showAdopted}
    <div class="upcoming-projects">
      <h2>{$i18n.sns_launchpad.upcoming_projects}</h2>
      <Projects testId="upcoming-projects" status={SnsSwapLifecycle.Adopted} />
    </div>
  {/if}

  {#if showCommitted}
    <div class="committed-projects">
      <h2>{$i18n.sns_launchpad.committed_projects}</h2>
      <Projects
        testId="committed-projects"
        status={SnsSwapLifecycle.Committed}
      />
    </div>
  {/if}

  <div class="proposals">
    <h2>{$i18n.sns_launchpad.proposals}</h2>
    <Proposals />
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: grid;
    gap: var(--padding-4x);

    // display "proposals" before "committed-projects" on mobile
    .committed-projects {
      order: 2;
      @include media.min-width(medium) {
        order: 1;
      }
    }
    .proposals {
      order: 1;
      @include media.min-width(medium) {
        order: 2;
      }
    }
  }

  h2 {
    margin: 0 0 var(--padding-3x);
  }
</style>
