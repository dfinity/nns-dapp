<script lang="ts">
  import { IconWest, IconEast } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { assertNonNullish, isNullish } from "@dfinity/utils";

  export let currentProposalId: bigint;
  // Filtered proposal ids sorted in descending order
  export let proposalIds: bigint[] = [];
  export let selectProposal: (proposalId: bigint) => void;

  let sortedProposalIds: bigint[] = [];
  // sort proposalIds in descent order
  $: sortedProposalIds = [...proposalIds].sort((a, b) => Number(b - a));

  let newerId: bigint | undefined;
  // TODO: switch to findLast() once it's available
  // use `as bigint[]` to avoid TS error (type T | undefined is not assignable to type bigint | undefined)
  $: newerId = ([...sortedProposalIds].reverse() as bigint[]).find(
    (id) => id > currentProposalId
  );

  let olderId: bigint | undefined;
  $: olderId = sortedProposalIds.find((id) => id < currentProposalId);

  const selectNewer = () => {
    assertNonNullish(newerId);
    selectProposal(newerId);
  };
  const selectOlder = () => {
    assertNonNullish(olderId);
    selectProposal(olderId);
  };
</script>

{#if sortedProposalIds.length > 1}
  <div role="toolbar" data-tid="proposal-nav">
    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.newer}
      on:click={selectNewer}
      class:hidden={isNullish(newerId)}
      data-tid="proposal-nav-newer"
    >
      <IconWest />
      {$i18n.proposal_detail.newer_short}</button
    >

    <button
      class="ghost"
      type="button"
      aria-label={$i18n.proposal_detail.older}
      on:click={selectOlder}
      class:hidden={isNullish(olderId)}
      data-tid="proposal-nav-older"
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
