<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";
  import ProjectInfoSection from "../lib/components/project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "../lib/components/project-detail/ProjectStatusSection.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";
  import {
    layoutBackStore,
    layoutTitleStore,
  } from "../lib/stores/layout.store";
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
  import { Principal } from "@dfinity/principal";
  import { toastsStore } from "../lib/stores/toasts.store";

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
    }
  });

  const loadSummary = (rootCanisterId: string) =>
    loadSnsSummary({
      rootCanisterId,
      onError: () => {
        // Set to not found
        $projectDetailStore.summary = undefined;
        goBack();
      },
    });

  const loadSwapState = (rootCanisterId: string) =>
    loadSnsSwapCommitment({
      rootCanisterId,
      onError: () => {
        // Set to not found
        $projectDetailStore.swapCommitment = undefined;
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
    summary: null,
    swapCommitment: null,
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

  const mapProjectDetail = (rootCanisterId: string) => {
    // Check project summaries are loaded in store
    if (
      $snsSummariesStore.length === 0 ||
      isNullish($snsSwapCommitmentsStore)
    ) {
      return;
    }
    // Check valid rootCanisterId
    try {
      if (rootCanisterId !== undefined) {
        Principal.fromText(rootCanisterId);
      }
    } catch (error) {
      // set values as not found
      $projectDetailStore.summary = undefined;
      $projectDetailStore.swapCommitment = undefined;
      return;
    }
    $projectDetailStore.summary =
      rootCanisterId !== undefined
        ? $snsSummariesStore.find(
            ({ rootCanisterId: rootCanister }) =>
              rootCanister?.toText() === rootCanisterId
          )
        : undefined;

    $projectDetailStore.swapCommitment =
      rootCanisterId !== undefined
        ? $snsSwapCommitmentsStore?.find(
            (item) =>
              item?.swapCommitment?.rootCanisterId?.toText() === rootCanisterId
          )?.swapCommitment
        : undefined;
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
      if (rootCanisterId === undefined) {
        return;
      }
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

  $: layoutTitleStore.set($projectDetailStore?.summary?.metadata.name ?? "");

  let loading: boolean;
  $: loading = $snsSummariesStore.length === 0;
  let notFound: boolean;
  $: notFound = $projectDetailStore.summary === undefined;

  $: {
    if (notFound) {
      toastsStore.error({
        labelKey: "error__sns.project_not_found",
      });
      routeStore.replace({ path: AppPath.Launchpad });
    }
  }
</script>

<main>
  <div class="stretch-mobile">
    <!-- notFound redirects to launchpad but we show the spinner until redirection occurs -->
    {#if loading || notFound}
      <Spinner />
    {:else}
      <div class="content-grid">
        <div class="content-a">
          <ProjectInfoSection />
        </div>
        <div class="content-b">
          <ProjectStatusSection />
        </div>
      </div>
    {/if}
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  .stretch-mobile {
    min-height: 100%;

    display: flex;
    align-items: stretch;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
