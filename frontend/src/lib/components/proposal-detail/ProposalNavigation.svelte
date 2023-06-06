<script lang="ts">
  import { IconWest, IconEast } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { isNullish, nonNullish } from "@dfinity/utils";

  export let currentProposalId: bigint | undefined;
  export let proposalIds: bigint[] = [];
  export let selectProposal: (proposalId: bigint) => void;

  let currentProposalIndex: number;
  $: currentProposalIndex =
    currentProposalId === undefined
      ? -1
      : proposalIds.indexOf(currentProposalId);

  let previousId: bigint | undefined;
  $: previousId =
    currentProposalIndex === -1
      ? undefined
      : proposalIds[currentProposalIndex - 1];

  let nextId: bigint | undefined;
  $: nextId =
    currentProposalIndex === -1
      ? undefined
      : proposalIds[currentProposalIndex + 1];

  let prevDisabled = true;
  $: prevDisabled = nonNullish(currentProposalId) && isNullish(previousId);

  let nextDisabled = true;
  $: nextDisabled = nonNullish(currentProposalId) && isNullish(nextId);

  const selectPrevious = () => {
    if (nonNullish(previousId)) {
      selectProposal(previousId);
    }
  };
  const selectNext = () => {
    if (nonNullish(nextId)) {
      selectProposal(nextId);
    }
  };
</script>

{#if nonNullish(currentProposalId) && proposalIds.length > 1}
  <div role="toolbar" data-tid="proposal-nav">
    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.newer}
      on:click={selectPrevious}
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
      on:click={selectNext}
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
