<script lang="ts">
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import type { SnsSummary } from "../../types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "../../types/project-detail.context";
  import ParticipateSwapModal from "../../modals/sns/ParticipateSwapModal.svelte";
  import { canUserParticipateToSwap } from "../../utils/projects.utils";
  import { i18n } from "../../stores/i18n";
  import Tooltip from "../ui/Tooltip.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let lifecycle: number;
  $: ({
    swap: {
      state: { lifecycle },
    },
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
</script>

{#if lifecycle === SnsSwapLifecycle.Open}
  {#if userCanParticipateToSwap}
    <button
      on:click={openModal}
      class="primary small"
      data-tid="sns-project-participate-button"
      >{$i18n.sns_project_detail.participate}</button
    >
  {:else}
    <Tooltip
      id="sns-project-participate-button-tooltip"
      text={$i18n.sns_project_detail.max_user_commitment_reached}
    >
      <button
        on:click={openModal}
        class="primary small"
        data-tid="sns-project-participate-button"
        disabled>{$i18n.sns_project_detail.participate}</button
      >
    </Tooltip>
  {/if}
{/if}

{#if showModal}
  <ParticipateSwapModal on:nnsClose={closeModal} />
{/if}
