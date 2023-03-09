<script lang="ts">
  import { setContext, onDestroy } from "svelte";
  import ProjectInfoSection from "$lib/components/project-detail/ProjectInfoSection.svelte";
  import ProjectMetadataSection from "$lib/components/project-detail/ProjectMetadataSection.svelte";
  import ProjectStatusSection from "$lib/components/project-detail/ProjectStatusSection.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import {
    loadSnsLifecycle,
    loadSnsSwapCommitment,
    loadSnsTotalCommitment,
    watchSnsTotalCommitment,
  } from "$lib/services/sns.services";
  import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
    type ProjectDetailStore,
  } from "$lib/types/project-detail.context";
  import { writable } from "svelte/store";
  import { snsSummariesStore } from "$lib/stores/sns.store";
  import { Principal } from "@dfinity/principal";
  import { toastsError } from "$lib/stores/toasts.store";
  import { debugSelectedProjectStore } from "$lib/derived/debug.derived";
  import { goto } from "$app/navigation";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { browser } from "$app/environment";
  import {
    loadSnsSwapMetrics,
    watchSnsMetrics,
  } from "$lib/services/sns-swap-metrics.services";
  import { SnsSwapLifecycle } from "@dfinity/sns";

  export let rootCanisterId: string | undefined | null;

  let unsubscribeWatchCommitment: () => void | undefined;
  let unsubscribeWatchMetrics: () => void | undefined;
  let enableWatchers = false;
  $: enableWatchers =
    $snsSummariesStore.find(
      ({ rootCanisterId: rootCanister }) =>
        rootCanister?.toText() === rootCanisterId
    )?.swap.lifecycle === SnsSwapLifecycle.Open;

  onDestroy(() => {
    unsubscribeWatchCommitment?.();
    unsubscribeWatchMetrics?.();
  });

  $: if (nonNullish(rootCanisterId) && isSignedIn($authStore.identity)) {
    loadCommitment({ rootCanisterId, forceFetch: false });
  }

  $: if (nonNullish(rootCanisterId) && enableWatchers) {
    unsubscribeWatchCommitment?.();
    unsubscribeWatchCommitment = watchSnsTotalCommitment({ rootCanisterId });
  }

  const reloadSnsMetrics = async ({ forceFetch }: { forceFetch: boolean }) => {
    const swapCanisterId = $projectDetailStore?.summary
      ?.swapCanisterId as Principal;

    if (isNullish(rootCanisterId) || isNullish(swapCanisterId)) {
      return;
    }

    await loadSnsSwapMetrics({
      rootCanisterId: Principal.fromText(rootCanisterId),
      swapCanisterId,
      forceFetch,
    });
  };

  const reload = async () => {
    if (rootCanisterId === undefined || rootCanisterId === null) {
      // We cannot reload data for an undefined rootCanisterd but we silent the error here because it most probably means that the user has already navigated away of the detail route
      return;
    }

    await Promise.all([
      loadSnsTotalCommitment({ rootCanisterId, strategy: "update" }),
      loadSnsLifecycle({ rootCanisterId }),
      loadCommitment({ rootCanisterId, forceFetch: true }),
      reloadSnsMetrics({ forceFetch: true }),
    ]);
  };

  const projectDetailStore = writable<ProjectDetailStore>({
    summary: null,
    swapCommitment: null,
  });

  debugSelectedProjectStore(projectDetailStore);

  setContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY, {
    store: projectDetailStore,
    reload,
  });

  let swapCanisterId: Principal | undefined;
  $: if (
    nonNullish(swapCanisterId) &&
    nonNullish(rootCanisterId) &&
    enableWatchers
  ) {
    reloadSnsMetrics({ forceFetch: false });
    unsubscribeWatchMetrics?.();

    unsubscribeWatchMetrics = watchSnsMetrics({
      rootCanisterId: Principal.fromText(rootCanisterId),
      swapCanisterId: swapCanisterId,
    });
  }

  const loadCommitment = ({
    rootCanisterId,
    forceFetch,
  }: {
    rootCanisterId: string;
    forceFetch: boolean;
  }) =>
    loadSnsSwapCommitment({
      rootCanisterId,
      onError: () => {
        // Set to not found
        $projectDetailStore.swapCommitment = undefined;
        goBack();
      },
      forceFetch,
    });

  const goBack = async (): Promise<void> => {
    if (!browser) {
      return;
    }

    return goto(AppPath.Launchpad, { replaceState: true });
  };

  // TODO: Change to a `let` that is recalculated when the store changes
  const setProjectStore = (rootCanisterId: string) => {
    // Check project summaries are loaded in store
    if ($snsSummariesStore.length === 0) {
      return;
    }
    // Check valid rootCanisterId
    try {
      if (rootCanisterId !== undefined) {
        Principal.fromText(rootCanisterId);
      }
    } catch (error: unknown) {
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
    (async () => {
      if (rootCanisterId === undefined || rootCanisterId === null) {
        await goBack();
        return;
      }
      setProjectStore(rootCanisterId);

      // TODO: Understand why this component doesn't subscribe to the store `projectDetailStore`.
      // Is it because it's created in this same component?
      const summary = $snsSummariesStore.find(
        ({ rootCanisterId: rootCanister }) =>
          rootCanister?.toText() === rootCanisterId
      );
      const newSwapCanisterId = summary?.swapCanisterId;

      if (newSwapCanisterId?.toText() !== swapCanisterId?.toText()) {
        swapCanisterId = newSwapCanisterId;
      }
    })();

  $: layoutTitleStore.set($projectDetailStore?.summary?.metadata.name ?? "");

  let notFound: boolean;
  $: notFound = $projectDetailStore.summary === undefined;

  $: (async () => {
    if (notFound) {
      toastsError({
        labelKey: "error__sns.project_not_found",
      });

      await goBack();
    }
  })();
</script>

<main>
  <div class="stretch-mobile">
    <div class="content-grid">
      <div class="content-a">
        <ProjectMetadataSection />
      </div>

      <div class="content-c">
        <ProjectInfoSection />
      </div>
      <div class="content-d">
        <ProjectStatusSection />
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .stretch-mobile {
    min-height: 100%;

    display: flex;
    align-items: stretch;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
