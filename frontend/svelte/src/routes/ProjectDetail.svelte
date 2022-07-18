<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";
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
    loadSnsSwapState,
    routePathRootCanisterId,
  } from "../lib/services/sns.services";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    snsSummariesStore,
    snsSwapStatesStore,
  } from "../lib/stores/projects.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
    type ProjectDetailStore,
  } from "../lib/types/project-detail.context";
  import { isNullable, nonNullable } from "../lib/utils/utils";
  import { writable } from "svelte/store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  let rootCanisterIdString: string | undefined;

  const projectDetailStore = writable<ProjectDetailStore>({
    summary: undefined,
    swapState: undefined,
  });

  // TODO: add projectDetailStore to debug store

  setContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY, {
    store: projectDetailStore,
  });

  const loadSummary = (rootCanisterId: string) => {
    // try to get from snsSummariesStore
    const summaryMaybe = $snsSummariesStore?.summaries?.find(
      ({ rootCanisterId: rootCanister }) =>
        rootCanister?.toText() === rootCanisterId
    );

    if (summaryMaybe !== undefined) {
      $projectDetailStore.summary = summaryMaybe;

      // do not reload already certified data
      if ($snsSummariesStore?.certified === true) {
        return;
      }
    }

    // flag loading state
    $projectDetailStore.summary = null;

    loadSnsSummary({
      rootCanisterId,
      onLoad: ({ response: summary }) =>
        ($projectDetailStore.summary = summary),
    });
  };

  const loadSwapState = (rootCanisterId: string) => {
    if (nonNullable($snsSwapStatesStore)) {
      // try to get from snsSwapStatesStore
      const swapItemMaybe = $snsSwapStatesStore.find(
        (item) => item?.swapState?.rootCanisterId?.toText() === rootCanisterId
      );

      if (swapItemMaybe !== undefined) {
        $projectDetailStore.swapState = swapItemMaybe.swapState;

        if (swapItemMaybe.certified === true) {
          // do not reload already certified data
          return;
        }
      }
    }

    // flag loading state
    $projectDetailStore.swapState = null;

    loadSnsSwapState({
      rootCanisterId,
      onLoad: ({ response: swapState }) =>
        ($projectDetailStore.swapState = swapState),
    });
  };

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

    if ($projectDetailStore.summary === undefined) {
      loadSummary(rootCanisterIdString);
    }

    if ($projectDetailStore.swapState === undefined) {
      loadSwapState(rootCanisterIdString);
    }
  });

  onDestroy(unsubscribe);

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Launchpad,
    });

  layoutBackStore.set(goBack);

  $: layoutTitleStore.set($projectDetailStore?.summary?.name ?? "");

  let loadingSummary: boolean;
  $: loadingSummary = isNullable($projectDetailStore.summary);
  let loadingSwapState: boolean;
  $: loadingSwapState = isNullable($projectDetailStore.swapState);

  // TODO(L2-838): if error redirect to launchpad and display error there
</script>

<MainContentWrapper sns>
  <div class="stretch-mobile">
    {#if loadingSummary && loadingSwapState}
      <Spinner />
    {:else}
      <TwoColumns>
        <div slot="left">
          {#if loadingSummary}
            <!-- TODO: replace with a skeleton -->
            <Spinner inline />
          {:else}
            <ProjectInfoSection />
          {/if}
        </div>
        <div slot="right">
          {#if loadingSummary || loadingSwapState}
            <!-- TODO: replace with a skeleton -->
            <Spinner inline />
          {:else}
            <ProjectStatusSection />
          {/if}
        </div>
      </TwoColumns>
    {/if}
  </div>
</MainContentWrapper>

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
