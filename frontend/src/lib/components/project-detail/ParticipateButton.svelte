<script lang="ts">
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext } from "svelte";
  import { BottomSheet, Spinner } from "@dfinity/gix-components";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import ParticipateSwapModal from "$lib/modals/sns/SwapModal/ParticipateSwapModal.svelte";
  import {
    canUserParticipateToSwap,
    hasUserParticipatedToSwap,
  } from "$lib/utils/projects.utils";
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import type { Principal } from "@dfinity/principal";
  import {
    getOpenTicket,
    participateInSnsSale,
  } from "$lib/services/sns-sale.services";
  import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
  import { nonNullish } from "@dfinity/utils";
  import { toastsShow, toastsSuccess } from "../../stores/toasts.store";
  import { nanoSecondsToDateTime } from "../../utils/date.utils";
  import { DEFAULT_TOAST_DURATION_MILLIS } from "../../constants/constants";
  import { isSignedIn } from "../../utils/auth.utils";
  import { authStore } from "../../stores/auth.store";
  import { logWithTimestamp } from "../../utils/dev.utils";
  import { snsTicketsStore } from "../../stores/sns-tickets.store";

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

  let busy = true;
  $: busy =
    rootCanisterId === undefined
      ? false
      : undefined === $snsTicketsStore[rootCanisterId.toText()];

  let error = true;
  $: error =
    rootCanisterId === undefined
      ? false
      : $snsTicketsStore[rootCanisterId.toText()]?.error !== undefined;

  let loadingTicketRootCanisterId: string | undefined;

  const updateTicket = async () => {
    // Avoid second call for the same rootCanisterId
    if (
      rootCanisterId === undefined ||
      loadingTicketRootCanisterId === rootCanisterId.toText()
    ) {
      return;
    }

    loadingTicketRootCanisterId = rootCanisterId.toText();

    await getOpenTicket({
      rootCanisterId,
      certified: true,
    });

    let ticket: Ticket | undefined =
      $snsTicketsStore[rootCanisterId?.toText()]?.ticket;

    // restore purchase
    if (ticket !== undefined) {
      // TODO(sale): refactor to reuse also in the modal

      toastsShow({
        level: "info",
        labelKey: "error__sns.sns_sale_proceed_with_existing_ticket",
        substitutions: {
          $time: nanoSecondsToDateTime(ticket.creation_time),
        },
        duration: DEFAULT_TOAST_DURATION_MILLIS,
      });
      const { success, retry } = await participateInSnsSale({
        rootCanisterId,
      });

      if (success) {
        await reload();

        toastsSuccess({
          labelKey: "sns_project_detail.participate_success",
        });

        // remove the ticket when it's complete
        snsTicketsStore.removeTicket(rootCanisterId);
      } else {
        // criticalError = true;
      }

      if (retry) {
        // TODO(sale): GIX-1310 - implement retry logic
        logWithTimestamp("[sale] retry TBD");
        return;
      }
    }
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
</script>

{#if lifecycle === SnsSwapLifecycle.Open}
  <BottomSheet>
    <div role="toolbar">
      <SignInGuard>
        {#if userCanParticipateToSwap}
          <button
            disabled={busy || error}
            on:click={openModal}
            class="primary participate"
            data-tid="sns-project-participate-button"
          >
            {#if busy}
              <span>
                <Spinner size="small" inline />
              </span>
            {/if}
            {userHasParticipatedToSwap
              ? $i18n.sns_project_detail.increase_participation
              : $i18n.sns_project_detail.participate}
          </button>
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
</style>
