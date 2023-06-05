<script lang="ts">
  import { IconWest, IconEast } from "@dfinity/gix-components";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { i18n } from "$lib/stores/i18n";

  export let currentProposalId: bigint | undefined;
  export let proposalIds: bigint[] | undefined;

  const dispatcher = createEventDispatcher();

  const next = () => dispatcher("nnsNavigation", nextId);
  const previous = () => dispatcher("nnsNavigation", previousId);

  let previousId: bigint | undefined;
  let nextId: bigint | undefined;

  const reset = () => {
    nextId = undefined;
    previousId = undefined;
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

      previousId = proposalIds[index - 1];
      nextId = proposalIds[index + 1];
    })();

  onDestroy(reset);

  let singleProposal: boolean;
  $: singleProposal =
    currentProposalId !== undefined &&
    nextId === undefined &&
    previousId === undefined;

  let prevDisabled = true;
  $: prevDisabled = currentProposalId !== undefined && previousId === undefined;

  let nextDisabled = true;
  $: nextDisabled = currentProposalId !== undefined && nextId === undefined;
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
