<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import Collapsible from "../../ui/Collapsible.svelte";
  import IconExpandCircleDown from "../../../icons/IconExpandCircleDown.svelte";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import VotingNeuronSelectContainer from "./VotingNeuronSelectContainer.svelte";
  import Value from "../../ui/Value.svelte";
  import { formatVotingPower } from "../../../utils/neuron.utils";

  export let proposalInfo: ProposalInfo;
  export let disabled: boolean;
  export let totalNeuronsVotingPower: bigint;

  let toggleContent: () => void;
  let expanded: boolean;

  let totalNeurons: number;
  $: totalNeurons = $votingNeuronSelectStore.neurons.length;
</script>

<Collapsible
  expandButton={false}
  externalToggle={true}
  bind:toggleContent
  bind:expanded
  wrapHeight
>
  <div slot="header" class="total" class:expanded>
    <div class="total-neurons">
      <span class="value"
        >{$i18n.proposal_detail__vote.neurons} ({totalNeurons})</span
      >
      <button
        class="icon"
        class:expanded
        on:click|stopPropagation={toggleContent}
      >
        <IconExpandCircleDown />
      </button>
    </div>

    <div class="total-voting-power">
      <span class="label">{$i18n.proposal_detail__vote.voting_power}</span>
      <Value
        >{formatVotingPower(
          totalNeuronsVotingPower === undefined ? 0n : totalNeuronsVotingPower
        )}</Value
      >
    </div>
  </div>

  <VotingNeuronSelectContainer {proposalInfo} {disabled} />
</Collapsible>

<style lang="scss">
  .total {
    display: flex;
    justify-content: space-between;
    gap: var(--padding);
    width: 100%;
    margin-top: var(--padding-3x);
    padding: var(--padding) var(--padding-2x);
  }

  .total-neurons,
  .total-voting-power {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    transition: transform ease-in 0.25s;

    &.expanded {
      transform: rotate(-180deg);
    }
  }
</style>
