<script lang="ts">
  import type { BallotInfo, NeuronInfo } from "@dfinity/nns";
  import BallotSummary from "./BallotSummary.svelte";
  import { i18n } from "../../../stores/i18n";
  import { ballotsWithDefinedProposal } from "../../../utils/neuron.utils";
  import InfiniteScroll from "../../ui/InfiniteScroll.svelte";

  export let neuron: NeuronInfo | undefined;

  const PAGE_LIMIT = 5;

  let ballots: Required<BallotInfo>[] = [];
  let ballotsToShow: Required<BallotInfo>[] = [];
  let ballotsIndex: number = PAGE_LIMIT;
  $: ballots = neuron === undefined ? [] : ballotsWithDefinedProposal(neuron);
  $: ballotsToShow = ballots.slice(0, ballotsIndex);
  const showMore = () => {
    ballotsIndex += PAGE_LIMIT;
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

    <InfiniteScroll
      pageLimit={PAGE_LIMIT}
      containerElement="ul"
      on:nnsIntersect={showMore}
    >
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
    margin-top: var(--padding);

    display: grid;
    grid-template-columns: 80% auto;
    grid-column-gap: var(--padding);
  }
</style>
