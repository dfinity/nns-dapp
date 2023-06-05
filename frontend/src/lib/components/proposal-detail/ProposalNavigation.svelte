<script lang="ts">
  import { IconWest, IconEast } from "@dfinity/gix-components";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { i18n } from "$lib/stores/i18n";

  export let currentProposalId: string | undefined;
  export let proposalIds: string[] | undefined;

  const dispatcher = createEventDispatcher();

  const next = () => dispatcher("nnsNavigation", nextIdString);
  const previous = () => dispatcher("nnsNavigation", previousIdString);

  let previousIdString: string | undefined;
  let nextIdString: string | undefined;

  const reset = () => {
    nextIdString = undefined;
    previousIdString = undefined;
  };

  $: currentProposalId,
    proposalIds,
    (() => {
      const index =
        currentProposalId === undefined
          ? undefined
          : proposalIds?.indexOf(currentProposalId);

      if (proposalIds === undefined || index === undefined || index < 0) {
        reset();
        return;
      }

      previousIdString = proposalIds[index - 1];
      nextIdString = proposalIds[index + 1];
    })();

  onDestroy(reset);

  let singleProposal: boolean;
  $: singleProposal =
    currentProposalId !== undefined &&
    nextIdString === undefined &&
    previousIdString === undefined;

  let prevDisabled = true;
  $: prevDisabled =
    currentProposalId !== undefined && previousIdString === undefined;

  let nextDisabled = true;
  $: nextDisabled =
    currentProposalId !== undefined && nextIdString === undefined;
</script>

{#if currentProposalId && !singleProposal}
  <div role="toolbar" data-tid="proposal-nav">
    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.newer}
      on:click={previous}
      class:hidden={prevDisabled}
      disabled={prevDisabled}
      data-tid="proposal-nav-previous"
    >
      <IconWest />
      {$i18n.proposal_detail.newer_short}</button
    >

    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.older}
      on:click={next}
      class:hidden={nextDisabled}
      disabled={nextDisabled}
      data-tid="proposal-nav-next"
    >
      {$i18n.proposal_detail.older_short}
      <IconEast />
    </button>
  </div>
{/if}

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;

    margin-bottom: var(--padding-3x);
  }

  button {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    font-size: inherit;

    &.hidden {
      visibility: hidden;
      opacity: 0;
    }
  }
</style>
