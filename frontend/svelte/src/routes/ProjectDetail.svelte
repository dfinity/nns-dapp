<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import ProjectInfoSection from "../lib/components/project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "../lib/components/project-detail/ProjectStatusSection.svelte";
  import TwoColumns from "../lib/components/ui/TwoColumns.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import {
    layoutBackStore,
    layoutTitleStore,
  } from "../lib/stores/layout.store";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import {
    loadSnsSummary,
    loadSnsSwapStateStore,
    routePathRootCanisterId,
  } from "../lib/services/sns.services";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    type SnsFullProject,
    snsFullProjectStore, snsSummariesStore,
  } from "../lib/stores/projects.store";
  import { getSnsProjectById } from "../lib/utils/sns.utils";
  import Spinner from "../lib/components/ui/Spinner.svelte";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  let rootCanisterIdString: string | undefined;
  let fullProject: SnsFullProject | undefined;
  $: fullProject = getSnsProjectById({
    id: rootCanisterIdString,
    projects: $snsFullProjectStore,
  });

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
      return;
    }
    const rootCanisterIdMaybe = routePathRootCanisterId(path);

    if (rootCanisterIdMaybe === undefined) {
      unsubscribe();
      routeStore.replace({ path: AppPath.Launchpad });
      return;
    }
    rootCanisterIdString = rootCanisterIdMaybe;

    await loadSnsSummary(rootCanisterIdString);
  });

  onDestroy(unsubscribe);

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Launchpad,
    });

  layoutBackStore.set(goBack);

  $: layoutTitleStore.set(fullProject?.summary.name ?? "");

  // TODO: do we want such subscribe in the component?
  $: $snsSummariesStore,
    (() => loadSnsSwapStateStore(rootCanisterIdString))();
</script>

{#if fullProject === undefined}
  <!-- TODO: Proper skeleton -->
  <Spinner />
{:else}
  <MainContentWrapper sns>
    <div class="stretch-mobile">
      <TwoColumns>
        <ProjectInfoSection summary={fullProject.summary} slot="left" />
        <ProjectStatusSection project={fullProject} slot="right" />
      </TwoColumns>
    </div>
  </MainContentWrapper>
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/media";
  .stretch-mobile {
    min-height: 100%;

    display: flex;
    align-items: stretch;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
