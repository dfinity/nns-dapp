<script lang="ts">
  import { IconWest, IconEast } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { assertNonNullish, isNullish } from "@dfinity/utils";

  export let currentProposalId: bigint;
  export let proposalIds: bigint[] = [];
  export let selectProposal: (proposalId: bigint) => void;

  let previousId: bigint | undefined;
  // TODO: switch to findLast() once it's available
  // use `as bigint[]` to avoid TS error (type T | undefined is not assignable to type bigint | undefined)
  $: previousId = ([...proposalIds].reverse() as bigint[]).find(
    (id) => id > currentProposalId
  );

  let nextId: bigint | undefined;
  $: nextId = proposalIds.find((id) => id < currentProposalId);

  const selectPrevious = () => {
    assertNonNullish(previousId);
    selectProposal(previousId);
  };
  const selectNext = () => {
    assertNonNullish(nextId);
    selectProposal(nextId);
  };
</script>

{#if proposalIds.length > 1}
  <div role="toolbar" data-tid="proposal-nav">
    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.newer}
      on:click={selectPrevious}
      class:hidden={isNullish(previousId)}
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
      class:hidden={isNullish(nextId)}
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
