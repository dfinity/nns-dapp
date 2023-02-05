<script lang="ts">
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext, onMount } from "svelte";
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
  import type { Ticket } from "@dfinity/sns/dist/candid/sns_swap";
  import { getOpenTicket } from "$lib/services/sns.services";
  import { Principal } from "@dfinity/principal";
  import { nonNullish } from "$lib/utils/utils";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

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

  let loadingTicket = true;
  let openTicket: Ticket | undefined;

  let rootCanisterId: Principal | undefined;
  $: rootCanisterId = nonNullish($projectDetailStore.rootCanisterId)
    ? Principal.fromText($projectDetailStore.rootCanisterId)
    : undefined;

  const updateTicket = async () => {
    console.log("ParticipateButton::updateTicket", rootCanisterId);
    if (rootCanisterId === undefined) {
      return;
    }
    loadingTicket = true;

    openTicket = await getOpenTicket({
      withTicket: false,
      rootCanisterId,
      certified: true,
    });

    loadingTicket = false;
  };
  $: rootCanisterId, updateTicket();

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
            disabled={loadingTicket || openTicket !== undefined}
            on:click={openModal}
            class="primary participate"
            data-tid="sns-project-participate-button"
          >
            {#if loadingTicket || openTicket !== undefined}
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
