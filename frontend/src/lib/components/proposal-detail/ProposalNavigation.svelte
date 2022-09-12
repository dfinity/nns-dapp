<script lang="ts">
  import en from "../../../tests/mocks/i18n.mock";
  import IconEast from "../../icons/IconEast.svelte";
  import IconWest from "../../icons/IconWest.svelte";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import type { ProposalInfo } from "@dfinity/nns";
  import {
    filteredProposals,
    uiProposals,
  } from "../../derived/proposals.derived";
  import { onDestroy } from "svelte";

  export let proposalInfo: ProposalInfo | undefined;

  const next = () => {
    if (nextProposal === undefined) {
      return;
    }

    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${nextProposal.id}`,
    });
  };

  const previous = () => {
    if (previousProposal === undefined) {
      return;
    }

    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${previousProposal.id}`,
    });
  };

  let previousProposal: ProposalInfo | undefined;
  let nextProposal: ProposalInfo | undefined;

  const reset = () => {
    nextProposal = undefined;
    previousProposal = undefined;
  };

  $: proposalInfo,
    (() => {
      if (proposalInfo === undefined) {
        reset();
        return;
      }

      // TODO: replace [...array].reverse().find() with findLast() once Firefox >= v104 is widely adopted - https://caniuse.com/?search=findlast
      previousProposal = [...$filteredProposals.proposals]
        .reverse()
        .find(
          ({ id }) =>
            proposalInfo?.id !== undefined &&
            id !== undefined &&
            id > proposalInfo.id
        );
      nextProposal = $filteredProposals.proposals.find(
        ({ id }) =>
          proposalInfo?.id !== undefined &&
          id !== undefined &&
          id < proposalInfo.id
      );
    })();

  onDestroy(reset);

  let lastProposal: boolean;
  $: lastProposal =
    proposalInfo !== undefined &&
    nextProposal === undefined &&
    previousProposal === undefined;
</script>

{#if $uiProposals.proposals.length > 0 && !lastProposal}
  <div role="toolbar">
    <button
      class="ghost"
      type="button"
      on:click={previous}
      class:loading={proposalInfo === undefined}
      class:hidden={proposalInfo !== undefined &&
        previousProposal === undefined}
      disabled={previousProposal === undefined}
    >
      <IconWest />
      {en.core.previous}</button
    >

    <button
      class="ghost"
      type="button"
      on:click={next}
      class:loading={proposalInfo === undefined}
      class:hidden={proposalInfo !== undefined && nextProposal === undefined}
      disabled={nextProposal === undefined}
    >
      {en.core.next}
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

    &.loading {
      color: var(--disable-contrast);
      pointer-events: none;
      cursor: default;
    }
  }
</style>
