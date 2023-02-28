<script lang="ts">
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext, onDestroy } from "svelte";
  import { BottomSheet, Spinner } from "@dfinity/gix-components";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import ParticipateSwapModal from "$lib/modals/sns/sale/ParticipateSwapModal.svelte";
  import {
    canUserParticipateToSwap,
    hasUserParticipatedToSwap,
  } from "$lib/utils/projects.utils";
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";
  import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
  import {
    hidePollingToast,
    restoreSnsSaleParticipation,
  } from "$lib/services/sns-sale.services";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { hasOpenTicketInProcess } from "$lib/utils/sns.utils";
  import type { TicketStatus } from "$lib/types/sale";
  import type { SaleStep } from "$lib/types/sale";
  import SaleInProgressModal from "$lib/modals/sns/sale/SaleInProgressModal.svelte";
  import SpinnerText from "$lib/components/ui/SpinnerText.svelte";

  const { store: projectDetailStore, reload } =
    getContext<ProjectDetailContext>(PROJECT_DETAIL_CONTEXT_KEY);

  let lifecycle: number;
  $: ({
    swap: { lifecycle },
  } =
    $projectDetailStore.summary ??
    ({
      swap: { state: { lifecycle: SnsSwapLifecycle.Unspecified } },
    } as unknown as SnsSummary));

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);

  let userCanParticipateToSwap = false;
  $: userCanParticipateToSwap = canUserParticipateToSwap({
    summary: $projectDetailStore.summary,
    swapCommitment: $projectDetailStore.swapCommitment,
  });

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = nonNullish($projectDetailStore?.summary?.rootCanisterId)
    ? $projectDetailStore?.summary?.rootCanisterId
    : undefined;

  // busy if open ticket is available or not requested
  let status: TicketStatus = "unknown";
  $: ({ status } = hasOpenTicketInProcess({
    rootCanisterId,
    ticketsStore: $snsTicketsStore,
  }));

  let busy = true;
  $: busy = status !== "none";

  // TODO(sale): find a better solution
  let loadingTicketRootCanisterId: string | undefined;

  let progressStep: SaleStep | undefined = undefined;

  const updateTicket = async () => {
    // Avoid second call for the same rootCanisterId
    if (
      rootCanisterId === undefined ||
      loadingTicketRootCanisterId === rootCanisterId.toText()
    ) {
      return;
    }

    snsTicketsStore.enablePolling(rootCanisterId);

    loadingTicketRootCanisterId = rootCanisterId.toText();

    const updateProgress = (step: SaleStep) => (progressStep = step);

    await restoreSnsSaleParticipation({
      rootCanisterId,
      postprocess: reload,
      updateProgress,
    });
  };

  // skip ticket update if the sns is not open
  $: if (
    lifecycle === SnsSwapLifecycle.Open &&
    isSignedIn($authStore.identity)
  ) {
    updateTicket();
  }

  let userHasParticipatedToSwap = false;
  $: userHasParticipatedToSwap = hasUserParticipatedToSwap({
    swapCommitment: $projectDetailStore.swapCommitment,
  });

  onDestroy(() => {
    if (rootCanisterId === undefined) {
      return;
    }

    // remove the ticket to stop sale-participation-retry from another pages because of the non-obvious UX
    snsTicketsStore.setTicket({
      rootCanisterId,
      ticket: undefined,
      keepPolling: false,
    });

    // Hide toasts when moving away from the page
    hidePollingToast();
  });
</script>

{#if lifecycle === SnsSwapLifecycle.Open}
  <BottomSheet>
    <div role="toolbar">
      <SignInGuard>
        {#if userCanParticipateToSwap}
          {#if busy}
            <div class="loader" data-tid="connecting_sale_canister">
              <SpinnerText
                >{$i18n.sns_sale.connecting_sale_canister}</SpinnerText
              >
            </div>
          {:else}
            <button
              disabled={busy}
              on:click={openModal}
              class="primary participate"
              data-tid="sns-project-participate-button"
            >
              {userHasParticipatedToSwap
                ? $i18n.sns_project_detail.increase_participation
                : $i18n.sns_project_detail.participate}
            </button>
          {/if}
        {:else}
          <Tooltip
            id="sns-project-participate-button-tooltip"
            text={$i18n.sns_project_detail.max_user_commitment_reached}
          >
            <button
              class="primary"
              data-tid="sns-project-participate-button"
              disabled>{$i18n.sns_project_detail.participate}</button
            >
          </Tooltip>
        {/if}
        <span slot="signin-cta">{$i18n.sns_project_detail.sign_in}</span>
      </SignInGuard>
    </div>
  </BottomSheet>
{/if}

{#if status === "open" && nonNullish(progressStep)}
  <SaleInProgressModal {progressStep} />
{/if}

{#if showModal}
  <ParticipateSwapModal on:nnsClose={closeModal} />
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .participate {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding);
  }

  [role="toolbar"] {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding: var(--padding-2x);

    @include media.min-width(medium) {
      align-items: center;
      justify-content: center;
    }

    @include media.min-width(large) {
      align-items: flex-start;
      justify-content: flex-start;
      padding: 0;
    }
  }

  .loader {
    padding: var(--padding) 0 0;
  }
</style>
