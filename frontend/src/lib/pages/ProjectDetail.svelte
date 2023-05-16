<script lang="ts">
  import { setContext, onDestroy } from "svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
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
  import {
    loadSnsSwapMetrics,
    watchSnsMetrics,
  } from "$lib/services/sns-swap-metrics.services";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
  import SaleInProgressModal from "$lib/modals/sns/sale/SaleInProgressModal.svelte";
  import {
    hidePollingToast,
    restoreSnsSaleParticipation,
  } from "$lib/services/sns-sale.services";
  import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
  import { SaleStep } from "$lib/types/sale";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { browser } from "$app/environment";
  import { IS_TEST_ENV } from "$lib/constants/mockable.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { userCountryIsNeeded } from "$lib/utils/projects.utils";
  import { loadUserCountry } from "$lib/services/user-country.services";

  export let rootCanisterId: string | undefined | null;

  const goBack = async (): Promise<void> => {
    // We want `goto` to be called only in the browser or in the test environment
    // Weirdly enough, the build step failed when I didn't have the `browser` check.
    // TODO: Find out why and fix it. It should not be needed.
    if (browser || IS_TEST_ENV) {
      goto(AppPath.Launchpad, { replaceState: true });
    }
  };

  /////////////////////////////////
  // Set up and update the context
  /////////////////////////////////

  // Used to reload the data after a new swap participation
  const reload = async () => {
    if (isNullish(rootCanisterId) || isNullish(swapCanisterId)) {
      // We cannot reload data for an undefined rootCanisterd or swapCanisterId but we silent the error here because it most probably means that the user has already navigated away of the detail route
      return;
    }

    await Promise.all([
      loadSnsTotalCommitment({ rootCanisterId, strategy: "update" }),
      loadSnsLifecycle({ rootCanisterId }),
      loadSnsSwapCommitment({
        rootCanisterId,
        onError: () => {
          // Set to not found
          $projectDetailStore.swapCommitment = undefined;
        },
        forceFetch: true,
      }),
      loadSnsSwapMetrics({
        forceFetch: true,
        rootCanisterId: Principal.fromText(rootCanisterId),
        swapCanisterId,
      }),
    ]);
  };

  const projectDetailStore = writable<ProjectDetailStore>({
    summary: null,
    swapCommitment: null,
    totalTokensSupply: null,
  });
  debugSelectedProjectStore(projectDetailStore);
  setContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY, {
    store: projectDetailStore,
    reload,
  });

  /**
   * Set up the projectDetailStore that lives in the context.
   *
   * We load all the sns summaries and swap commitments on the global scale of the app.
   * That's why we subscribe to these stores - i.e. each times they change, we can try to find the current root canister id within these data.
   */
  $: $snsSummariesStore,
    $snsSwapCommitmentsStore,
    $snsTotalSupplyTokenAmountStore,
    (async () => {
      if (isNullish(rootCanisterId)) {
        await goBack();
        return;
      }
      // Check project summaries are loaded in store
      if ($snsSummariesStore.length === 0) {
        return;
      }
      // Check valid rootCanisterId
      try {
        Principal.fromText(rootCanisterId);
      } catch (error: unknown) {
        // set values as not found
        $projectDetailStore.summary = undefined;
        $projectDetailStore.swapCommitment = undefined;
        $projectDetailStore.totalTokensSupply = undefined;
        return;
      }
      $projectDetailStore.summary = $snsSummariesStore.find(
        ({ rootCanisterId: rootCanister }) =>
          rootCanister?.toText() === rootCanisterId
      );

      $projectDetailStore.swapCommitment = $snsSwapCommitmentsStore?.find(
        (item) =>
          item?.swapCommitment?.rootCanisterId?.toText() === rootCanisterId
      )?.swapCommitment;

      $projectDetailStore.totalTokensSupply =
        $snsTotalSupplyTokenAmountStore[rootCanisterId];
    })();

  /////////////////////////////////
  // Set up watchers and load the data in stores
  /////////////////////////////////

  $: layoutTitleStore.set($projectDetailStore?.summary?.metadata.name ?? "");

  let enableOpenProjectWatchers = false;
  $: enableOpenProjectWatchers =
    $projectDetailStore?.summary?.swap.lifecycle === SnsSwapLifecycle.Open;

  let swapCanisterId: Principal | undefined;
  $: swapCanisterId = $projectDetailStore.summary?.swapCanisterId;

  $: if (nonNullish(rootCanisterId) && $authSignedInStore) {
    loadSnsSwapCommitment({
      rootCanisterId,
      onError: () => {
        // Set to not found
        $projectDetailStore.swapCommitment = undefined;
      },
    });
  }

  let shouldLoadUserCountry = false;
  $: shouldLoadUserCountry = userCountryIsNeeded({
    summary: $projectDetailStore?.summary,
    swapCommitment: $projectDetailStore?.swapCommitment,
    loggedIn: $authSignedInStore,
  });
  $: if (shouldLoadUserCountry) {
    loadUserCountry();
  }

  let unsubscribeWatchCommitment: () => void | undefined;
  let unsubscribeWatchMetrics: () => void | undefined;
  $: if (nonNullish(rootCanisterId) && nonNullish(swapCanisterId)) {
    // We load the metrics to have them initially available before setInterval starts
    loadSnsSwapMetrics({
      rootCanisterId: Principal.fromText(rootCanisterId),
      swapCanisterId,
      forceFetch: false,
    });

    if (enableOpenProjectWatchers) {
      unsubscribeWatchCommitment?.();
      unsubscribeWatchCommitment = watchSnsTotalCommitment({ rootCanisterId });

      unsubscribeWatchMetrics?.();
      unsubscribeWatchMetrics = watchSnsMetrics({
        rootCanisterId: Principal.fromText(rootCanisterId),
        swapCanisterId: swapCanisterId,
      });
    }
  }

  /////////////////////////////////
  // Restore participation
  /////////////////////////////////

  // Flag to avoid second getOpenTicket call on same page navigation
  let loadingTicketRootCanisterIdText: string | undefined = undefined;
  let userCommitment: undefined | bigint;
  $: userCommitment = getCommitmentE8s($projectDetailStore.swapCommitment);
  let progressStep: SaleStep | undefined = undefined;
  $: if (nonNullish(progressStep) && progressStep === SaleStep.DONE) {
    // Leave some time to the user to see the final step being done
    setTimeout(() => {
      progressStep = undefined;
    }, 1000);
  }
  // skip ticket update if
  // - the sns is not open
  // - the user is not sign in
  // - user commitment information is not loaded
  // - project swap canister id is not loaded, needed for the ticket call
  // - no root canister id
  // - ticket already in progress for the same root canister id
  $: if (
    $projectDetailStore.summary?.swap.lifecycle === SnsSwapLifecycle.Open &&
    $authSignedInStore &&
    nonNullish(userCommitment) &&
    nonNullish(swapCanisterId) &&
    nonNullish(rootCanisterId) &&
    loadingTicketRootCanisterIdText !== rootCanisterId
  ) {
    loadingTicketRootCanisterIdText = rootCanisterId;

    const updateProgress = (step: SaleStep) => (progressStep = step);

    restoreSnsSaleParticipation({
      rootCanisterId: Principal.fromText(rootCanisterId),
      userCommitment,
      swapCanisterId,
      postprocess: reload,
      updateProgress,
    });
  }

  /////////////////////////////////
  // Clean up and checks
  /////////////////////////////////

  $: {
    const notFound = $projectDetailStore.summary === undefined;
    if (notFound) {
      toastsError({
        labelKey: "error__sns.project_not_found",
      });

      goBack();
    }
  }

  onDestroy(() => {
    unsubscribeWatchCommitment?.();
    unsubscribeWatchMetrics?.();
    if (isNullish(rootCanisterId)) {
      return;
    }

    try {
      // remove the ticket to stop sale-participation-retry from another pages because of the non-obvious UX
      snsTicketsStore.setTicket({
        rootCanisterId: Principal.fromText(rootCanisterId),
        ticket: undefined,
      });
    } catch (error: unknown) {
      // ignore error
      // it can happen if the rootCanisterId is not valid
    }

    // TODO: Improve cancellatoin of actions onDestroy
    // The polling was triggered by `restoreSnsSaleParticipation` call and needs to be canceled explicitly.
    // TODO: Reenable https://dfinity.atlassian.net/browse/GIX-1574
    // cancelPollGetOpenTicket();

    // Hide toasts when moving away from the page
    hidePollingToast();
  });
</script>

<TestIdWrapper testId="project-detail-component">
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

  {#if nonNullish(progressStep)}
    <SaleInProgressModal {progressStep} />
  {/if}
</TestIdWrapper>

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
