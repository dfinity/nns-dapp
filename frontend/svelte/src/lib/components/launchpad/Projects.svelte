<script lang="ts">
  import {
    loadSnsSummaries,
    loadSnsSwapCommitments,
  } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import {
    snsFullProjectsStore,
    type SnsFullProject,
    snsesCountStore,
    snsSummariesStore,
    snsSwapCommitmentsStore,
  } from "../../stores/projects.store";
  import { onMount } from "svelte";
  import ProjectCard from "./ProjectCard.svelte";
  import CardGrid from "../ui/CardGrid.svelte";
  import SkeletonProjectCard from "../ui/SkeletonProjectCard.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { isNullable } from "../../utils/utils";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";

  let projects: SnsFullProject[] | undefined;
  $: projects = $snsFullProjectsStore;

  let projectCount: number | undefined;
  $: projectCount = $snsesCountStore;

  let loading: boolean = false;
  $: loading =
    isNullable($snsSummariesStore) || isNullable($snsSwapCommitmentsStore);

  // TODO(L2-863): ask Mischa if use should be redirected or if a message should be displayed
  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Accounts,
    });

  const load = () => {
    if ($snsSummariesStore === undefined) {
      loadSnsSummaries({ onError: goBack });
    }
    if ($snsSwapCommitmentsStore === undefined) {
      loadSnsSwapCommitments({ onError: goBack });
    }
  };

  onMount(load);
</script>

{#if loading}
  {#if projectCount === undefined}
    <div>
      <Spinner inline />
    </div>
  {:else}
    <CardGrid>
      {#each Array(projectCount) as _}
        <SkeletonProjectCard />
      {/each}
    </CardGrid>
  {/if}
{:else if projects !== undefined}
  <CardGrid>
    {#each projects as project (project.rootCanisterId.toText())}
      <ProjectCard {project} />
    {/each}
  </CardGrid>
  {#if projects.length === 0}
    <p>{$i18n.sns_launchpad.no_projects}</p>
  {/if}
{/if}

<style lang="scss">
  // match page spinner
  div {
    color: rgba(var(--background-contrast-rgb), var(--very-light-opacity));
  }
</style>
