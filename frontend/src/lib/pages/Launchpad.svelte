<script lang="ts">
  import Projects from "$lib/components/launchpad/Projects.svelte";
  import Proposals from "$lib/components/launchpad/Proposals.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { committedProjectsStore } from "$lib/stores/projects.store";
  import {isSignedIn} from "$lib/utils/auth.utils";
  import {authStore} from "$lib/stores/auth.store";

  let showCommitted = false;
  $: showCommitted = ($committedProjectsStore?.length ?? []) > 0;

  // TODO: remove once proposals also public
  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

<main>
  <h2>{$i18n.sns_launchpad.open_projects}</h2>
  <Projects status={SnsSwapLifecycle.Open} />

  {#if showCommitted}
    <h2>{$i18n.sns_launchpad.committed_projects}</h2>
    <Projects status={SnsSwapLifecycle.Committed} />
  {/if}

  {#if signedIn}
    <h2>{$i18n.sns_launchpad.proposals}</h2>
    <Proposals />
  {/if}
</main>

<style lang="scss">
  h2 {
    margin: var(--padding-8x) 0 var(--padding-3x);

    &:first-of-type {
      margin-top: var(--padding);
    }
  }
</style>
