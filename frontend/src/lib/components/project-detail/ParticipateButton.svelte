<script lang="ts">
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext } from "svelte";
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
  import Tooltip from "../ui/Tooltip.svelte";

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

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);

  let userCanParticipateToSwap: boolean = false;
  $: userCanParticipateToSwap = canUserParticipateToSwap({
    summary: $projectDetailStore.summary,
    swapCommitment: $projectDetailStore.swapCommitment,
  });

  let userHasParticipatedToSwap: boolean = false;
  $: userHasParticipatedToSwap = hasUserParticipatedToSwap({
    swapCommitment: $projectDetailStore.swapCommitment,
  });
</script>

{#if lifecycle === SnsSwapLifecycle.Open}
  {#if userCanParticipateToSwap}
    <button
      on:click={openModal}
      class="primary"
      data-tid="sns-project-participate-button"
      >{userHasParticipatedToSwap
        ? $i18n.sns_project_detail.increase_participation
        : $i18n.sns_project_detail.participate}</button
    >
  {:else}
    <Tooltip
      id="sns-project-participate-button-tooltip"
      text={$i18n.sns_project_detail.max_user_commitment_reached}
    >
      <button class="primary" data-tid="sns-project-participate-button" disabled
        >{$i18n.sns_project_detail.participate}</button
      >
    </Tooltip>
  {/if}
{/if}

{#if showModal}
  <ParticipateSwapModal on:nnsClose={closeModal} />
{/if}
