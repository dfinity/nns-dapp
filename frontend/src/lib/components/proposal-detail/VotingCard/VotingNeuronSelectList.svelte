<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import { votingNeuronSelectStore } from "../../../stores/proposals.store";
  import Checkbox from "../../ui/Checkbox.svelte";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { formatVotingPower } from "../../../utils/neuron.utils";
  import { getVotingPower } from "../../../utils/proposals.utils";
  import type { ProposalInfo } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;
  export let disabled: boolean;

  const toggleSelection = (neuronId: bigint) =>
    votingNeuronSelectStore.toggleSelection(neuronId);
</script>

<ul>
  {#each $votingNeuronSelectStore.neurons as neuron}
    <li>
      <Checkbox
        inputId={`${neuron.neuronId}`}
        checked={$votingNeuronSelectStore.selectedIds.includes(neuron.neuronId)}
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
          class="voting-power value"
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

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

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
      justify-content: space-between;
      grid-gap: var(--padding);

      order: 1;
    }
  }

  span {
    word-break: break-word;
  }

  .voting-power {
    text-align: right;
  }
</style>
