<script lang="ts">
  import type { BallotInfo, NeuronInfo } from "@dfinity/nns";
  import BallotSummary from "./BallotSummary.svelte";
  import { i18n } from "../../../stores/i18n";
  import { ballotsWithDefinedProposal } from "../../../utils/neuron.utils";

  export let neuron: NeuronInfo | undefined;

  let ballots: Required<BallotInfo>[] = [];
  $: ballots = neuron === undefined ? [] : ballotsWithDefinedProposal(neuron);
</script>

{#if neuron !== undefined}
  {#if ballots.length === 0}
    <p>{$i18n.neuron_detail.no_ballots}</p>
  {:else}
    <h4>
      {$i18n.proposal_detail.title}
      <span>{$i18n.neuron_detail.vote}</span>
    </h4>

    <ul>
      {#each ballots as ballot}
        <li>
          <BallotSummary {ballot} />
        </li>
      {/each}
    </ul>
  {/if}
{/if}

<style lang="scss">
  h4 {
    display: flex;
    justify-content: space-between;
    line-height: var(--line-height-standard);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    margin-top: var(--padding);

    display: grid;
    grid-template-columns: 80% auto;
    grid-column-gap: var(--padding);
  }
</style>
