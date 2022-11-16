<script lang="ts">
  import { setContext } from "svelte";
  import ProjectInfoSection from "$lib/components/project-detail/ProjectInfoSection.svelte";
  import ProjectStatusSection from "$lib/components/project-detail/ProjectStatusSection.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import {
    loadSnsSummary,
    loadSnsSwapCommitment,
  } from "$lib/services/sns.services";
  import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
    type ProjectDetailStore,
  } from "$lib/types/project-detail.context";
  import { isNullish } from "$lib/utils/utils";
  import { writable } from "svelte/store";
  import { snsSummariesStore } from "$lib/stores/sns.store";
  import { Principal } from "@dfinity/principal";
  import { toastsError } from "$lib/stores/toasts.store";
  import { debugSelectedProjectStore } from "$lib/stores/debug.store";
  import { goto } from "$app/navigation";

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
    if (rootCanisterId === undefined || rootCanisterId === null) {
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

  debugSelectedProjectStore(projectDetailStore);

  setContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY, {
    store: projectDetailStore,
    reload,
  });

  const goBack = (): Promise<void> =>
    goto(AppPath.Launchpad, { replaceState: true });

  const mapProjectDetail = (rootCanisterId: string) => {
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

  export let rootCanisterId: string | undefined | null;

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
      mapProjectDetail(rootCanisterId);
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
        <ProjectInfoSection />
      </div>
      <div class="content-b">
        <ProjectStatusSection />
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  @use "../../../node_modules/@dfinity/gix-components/styles/mixins/media";
  .stretch-mobile {
    min-height: 100%;

    display: flex;
    align-items: stretch;

    @include media.min-width(large) {
      display: block;
    }
  }
</style>
