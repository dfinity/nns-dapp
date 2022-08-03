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
    loadSnsSwapCommitment,
    routePathRootCanisterId,
  } from "../lib/services/sns.services";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import {
    snsQueryStore,
    snsSwapCommitmentsStore,
  } from "../lib/stores/sns.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
    type ProjectDetailStore,
  } from "../lib/types/project-detail.context";
  import { isNullish, nonNullish } from "../lib/utils/utils";
  import { writable } from "svelte/store";
  import { concatSnsSummary } from "../lib/utils/sns.utils";
  import { snsSummariesStore } from "../lib/stores/sns.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  const loadSummary = (rootCanisterId: string) =>
    loadSnsSummary({
      rootCanisterId,
      onLoad: ({ response }) =>
        ($projectDetailStore.summary = concatSnsSummary(response)),
      onError: () => {
        // hide unproven data
        $projectDetailStore.summary = null;
        goBack();
      },
    });

  const loadSwapState = (rootCanisterId: string) =>
    loadSnsSwapCommitment({
      rootCanisterId,
      onLoad: ({ response: swapCommitment }) =>
        ($projectDetailStore.swapCommitment = swapCommitment),
      onError: () => {
        // hide unproven data
        $projectDetailStore.swapCommitment = null;
        goBack();
      },
    });

  const reload = () => {
    const { path } = $routeStore;

    const rootCanisterId = routePathRootCanisterId(path);

    if (rootCanisterId === undefined) {
      // We cannot reload data for an undefined rootCanisterd but we silent the error here because it most probably means that the user has already navigated away of the detail route
      return;
    }

    loadSummary(rootCanisterId);
    loadSwapState(rootCanisterId);
  };

  const projectDetailStore = writable<ProjectDetailStore>({
    summary: undefined,
    swapCommitment: undefined,
  });

  // TODO: add projectDetailStore to debug store

  setContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY, {
    store: projectDetailStore,
    reload,
  });

  const goBack = () => {
    unsubscribe();
    routeStore.replace({ path: AppPath.Launchpad });
  };

  const getOrLoadSummary = (rootCanisterId: string) => {
    // try to get from snsSummariesStore
    const summaryMaybe = $snsSummariesStore?.find(
      ({ rootCanisterId: rootCanister }) =>
        rootCanister?.toText() === rootCanisterId
    );

    if (summaryMaybe !== undefined) {
      $projectDetailStore.summary = summaryMaybe;

      // do not reload already certified data
      if ($snsQueryStore?.certified === true) {
        return;
      }
    }

    // flag loading state
    $projectDetailStore.summary = null;

    loadSummary(rootCanisterId);
  };

  const getOrLoadSwapState = (rootCanisterId: string) => {
    if (nonNullish($snsSwapCommitmentsStore)) {
      // try to get from snsSwapStatesStore
      const swapItemMaybe = $snsSwapCommitmentsStore.find(
        (item) =>
          item?.swapCommitment?.rootCanisterId?.toText() === rootCanisterId
      );

      if (swapItemMaybe !== undefined) {
        $projectDetailStore.swapCommitment = swapItemMaybe.swapCommitment;

        if (swapItemMaybe.certified === true) {
          // do not reload already certified data
          return;
        }
      }
    }

    // flag loading state
    $projectDetailStore.swapCommitment = null;

    loadSwapState(rootCanisterId);
  };

  const unsubscribe = routeStore.subscribe(async ({ path }) => {
    if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
      return;
    }

    const rootCanisterId = routePathRootCanisterId(path);
    if (rootCanisterId === undefined) {
      goBack();
      return;
    }

    if ($projectDetailStore.summary === undefined) {
      getOrLoadSummary(rootCanisterId);
    }

    if ($projectDetailStore.swapCommitment === undefined) {
      getOrLoadSwapState(rootCanisterId);
    }
  });

  onDestroy(unsubscribe);

  layoutBackStore.set(goBack);

  $: layoutTitleStore.set($projectDetailStore?.summary?.name ?? "");

  let loadingSummary: boolean;
  $: loadingSummary = isNullish($projectDetailStore.summary);
  let loadingSwapState: boolean;
  $: loadingSwapState = isNullish($projectDetailStore.swapCommitment);

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
          <ProjectStatusSection />
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
