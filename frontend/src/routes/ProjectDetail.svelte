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
  import { snsSwapCommitmentsStore } from "../lib/stores/sns.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
    type ProjectDetailStore,
  } from "../lib/types/project-detail.context";
  import { isNullish } from "../lib/utils/utils";
  import { writable } from "svelte/store";
  import { snsSummariesStore } from "../lib/stores/sns.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  const loadSummary = (rootCanisterId: string) =>
    loadSnsSummary({
      rootCanisterId,
      onError: () => {
        // hide unproven data
        $projectDetailStore.summary = null;
        goBack();
      },
    });

  const loadSwapState = (rootCanisterId: string) =>
    loadSnsSwapCommitment({
      rootCanisterId,
      onError: () => {
        // hide unproven data
        $projectDetailStore.swapCommitment = null;
        goBack();
      },
    });

  const reload = async () => {
    const { path } = $routeStore;

    const rootCanisterId = routePathRootCanisterId(path);

    if (rootCanisterId === undefined) {
      // We cannot reload data for an undefined rootCanisterd but we silent the error here because it most probably means that the user has already navigated away of the detail route
      return;
    }

    await Promise.all([
      loadSummary(rootCanisterId),
      loadSwapState(rootCanisterId),
    ]);
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

  const mapProjectDetail = (rootCanisterId: string | undefined) => {
    $projectDetailStore.summary =
      rootCanisterId !== undefined
        ? $snsSummariesStore.find(
            ({ rootCanisterId: rootCanister }) =>
              rootCanister?.toText() === rootCanisterId
          )
        : null;

    $projectDetailStore.swapCommitment =
      rootCanisterId !== undefined
        ? $snsSwapCommitmentsStore?.find(
            (item) =>
              item?.swapCommitment?.rootCanisterId?.toText() === rootCanisterId
          )?.swapCommitment
        : null;
  };

  /**
   * We load all the sns summaries and swap commitments on the global scale of the app. That's why we subscribe to these stores - i.e. each times they change, we can try to find the current root canister id within these data.
   */
  $: $snsSummariesStore,
    $snsSwapCommitmentsStore,
    (() => {
      const { path } = $routeStore;

      if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
        return;
      }

      const rootCanisterId = routePathRootCanisterId(path);
      mapProjectDetail(rootCanisterId);
    })();

  /**
   * We subscribe to the route in a particular function because if not root canister id is provided in the url it redirects to `goBack` which needs the particular usage of `unsubscribe` to avoid loops.
   */
  const unsubscribe = routeStore.subscribe(({ path }) => {
    if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
      return;
    }

    const rootCanisterId = routePathRootCanisterId(path);
    if (rootCanisterId === undefined) {
      goBack();
      return;
    }

    mapProjectDetail(rootCanisterId);
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
          <ProjectInfoSection />
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
