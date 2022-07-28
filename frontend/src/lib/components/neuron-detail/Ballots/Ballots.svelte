<script lang="ts">
  import type { BallotInfo, NeuronInfo } from "@dfinity/nns";
  import BallotSummary from "./BallotSummary.svelte";
  import { i18n } from "../../../stores/i18n";
  import { ballotsWithDefinedProposal } from "../../../utils/neuron.utils";
  import InfiniteScroll from "../../ui/InfiniteScroll.svelte";
  import { debounce } from "../../../utils/utils";

  export let neuron: NeuronInfo | undefined;

  const PAGE_LIMIT = 5;

  let ballots: Required<BallotInfo>[] = [];
  // Each `BallotSummary` fetches the proposal from the canister.
  // We want to avoid making too many calls, since a neuron can vote in many proposals.
  let ballotsToShow: Required<BallotInfo>[] = [];
  let ballotsIndex: number = PAGE_LIMIT;
  $: ballots = neuron === undefined ? [] : ballotsWithDefinedProposal(neuron);
  $: ballotsToShow = ballots.slice(0, ballotsIndex);

  // We fake fetching the next `PAGE_LIMIT` ballots.
  const nextPage = debounce(() => {
    ballotsIndex += PAGE_LIMIT;
    fakeLoading = false;
  });
  let fakeLoading: boolean = false;
  const showMore = () => {
    if (fakeLoading) {
      return;
    }
    if (ballotsIndex >= ballots.length) {
      return;
    }
    fakeLoading = true;
    nextPage();
  };
</script>

{#if neuron !== undefined}
  {#if ballots.length === 0}
    <p>{$i18n.neuron_detail.no_ballots}</p>
  {:else}
    <h4>
      {$i18n.proposal_detail.title}
      <span>{$i18n.neuron_detail.vote}</span>
    </h4>

    <InfiniteScroll pageLimit={PAGE_LIMIT} on:nnsIntersect={showMore}>
      {#each ballotsToShow as ballot}
        <li>
          <BallotSummary {ballot} />
        </li>
      {/each}
    </InfiniteScroll>
  {/if}
{/if}

<style lang="scss">
  h4 {
    display: flex;
    justify-content: space-between;
    line-height: var(--line-height-standard);
  }

  li {
    padding: var(--padding-2x) 0;

    display: grid;
    grid-template-columns: 80% auto;
    grid-column-gap: var(--padding);

    border-top: 1px solid currentColor;
    &:first-child {
      border-top: none;
    }
  }
</style>
