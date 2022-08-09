<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import {
    getVotingPower,
    selectedNeuronsVotingPower,
  } from "../../../utils/proposals.utils";
  import { formatVotingPower } from "../../../utils/neuron.utils";
  import Checkbox from "../../ui/Checkbox.svelte";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import Value from "../../ui/Value.svelte";
  import type { VoteInProgress } from "../../../stores/voting.store";

  export let proposalInfo: ProposalInfo;
  export let voteInProgress: VoteInProgress | undefined = undefined;

  let total: bigint;
  let disabled: boolean = false;

  $: disabled = voteInProgress !== undefined;

  $: total = selectedNeuronsVotingPower({
    neurons: $votingNeuronSelectStore.neurons,
    selectedIds: $votingNeuronSelectStore.selectedIds,
    proposal: proposalInfo,
  });

  const toggleSelection = (neuronId: bigint) =>
    votingNeuronSelectStore.toggleSelection(neuronId);
</script>

{#if $votingNeuronSelectStore.neurons.length > 0}
  <p class="headline">
    <span>{$i18n.proposal_detail__vote.neurons}</span>
    <span>{$i18n.proposal_detail__vote.voting_power}</span>
  </p>

  <ul>
    {#each $votingNeuronSelectStore.neurons as neuron}
      <li>
        <Checkbox
          inputId={`${neuron.neuronId}`}
          checked={$votingNeuronSelectStore.selectedIds.includes(
            neuron.neuronId
          )}
          on:nnsChange={() => toggleSelection(neuron.neuronId)}
          text="block"
          selector="neuron-checkbox"
          {disabled}
        >
          <span
            class="neuron-id value"
            aria-label={replacePlaceholders(
              $i18n.proposal_detail__vote.cast_vote_neuronId,
              {
                $neuronId: `${neuron.neuronId}`,
              }
            )}>{`${neuron.neuronId}`}</span
          >
          <span
            class="neuron-voting-power value"
            aria-label={replacePlaceholders(
              $i18n.proposal_detail__vote.cast_vote_votingPower,
              {
                $votingPower: formatVotingPower(
                  getVotingPower({ neuron, proposal: proposalInfo })
                ),
              }
            )}
            >{`${formatVotingPower(
              getVotingPower({ neuron, proposal: proposalInfo })
            )}`}</span
          >
        </Checkbox>
      </li>
    {/each}
  </ul>

  <p class="total">
    <span>{$i18n.proposal_detail__vote.total}</span>
    <Value>{formatVotingPower(total === undefined ? 0n : total)}</Value>
  </p>
{/if}

<style lang="scss">
  @use "../../../themes/mixins/media";

  .headline {
    padding: var(--padding-0_5x) var(--padding) var(--padding-0_5x)
      calc(4.25 * var(--padding));
    display: flex;
    justify-content: space-between;

    font-size: var(--font-size-h4);
    border-bottom: 1px solid currentColor;

    // hide voting-power-headline because of the layout
    :last-child {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;

    // checkbox restyling
    :global(.neuron-checkbox) {
      padding: var(--padding);
    }
    :global(input[type="checkbox"]) {
      margin-left: 0;
    }
    :global(label) {
      margin-left: var(--padding-0_5x);

      display: flex;
      flex-direction: column;
      justify-content: space-between;

      order: 1;

      @include media.min-width(small) {
        flex-direction: row;
        align-items: center;
      }
    }

    .neuron-id {
      font-size: var(--font-size-h5);

      @include media.min-width(medium) {
        font-size: var(--font-size-h4);
      }
    }
    .neuron-voting-power {
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }

  .total {
    margin-top: var(--padding);
    padding: var(--padding);

    display: flex;
    align-items: center;
    justify-content: end;

    border-top: 1px solid currentColor;

    text-align: right;
    font-size: var(--font-size-h5);

    @include media.min-width(medium) {
      font-size: var(--font-size-h4);
    }

    span {
      margin-right: var(--padding);
      font-size: var(--font-size-ultra-small);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }
</style>
