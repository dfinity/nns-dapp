<script lang="ts">
  import { IconWest, IconEast } from "@dfinity/gix-components";
  import { uiProposals } from "$lib/derived/proposals.derived";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { i18n } from "$lib/stores/i18n";

  export let proposalIdString: string | undefined;
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

  $: proposalIdString,
    proposalIds,
    (() => {
      const index =
        proposalIdString === undefined
          ? undefined
          : proposalIdString && proposalIds?.indexOf(proposalIdString);

      if (proposalIds === undefined || index === undefined || index < 0) {
        reset();
        return;
      }

      previousIdString = proposalIds[index - 1];
      nextIdString = proposalIds[index + 1];
    })();

  onDestroy(reset);

  let lastProposal: boolean;
  $: lastProposal =
    proposalIdString !== undefined &&
    nextIdString === undefined &&
    previousIdString === undefined;
</script>

{#if $uiProposals.proposals.length > 0 && !lastProposal}
  <div role="toolbar">
    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.newer}
      on:click={previous}
      class:hidden={proposalIdString !== undefined &&
        previousIdString === undefined}
      disabled={proposalIdString !== undefined &&
        previousIdString === undefined}
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
      class:hidden={proposalIdString !== undefined &&
        nextIdString === undefined}
      disabled={proposalIdString !== undefined && nextIdString === undefined}
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
