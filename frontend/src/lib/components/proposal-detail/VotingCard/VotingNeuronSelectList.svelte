<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { votingNeuronSelectStore } from "$lib/stores/proposals.store";
  import { Checkbox } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { getVotingPower } from "$lib/utils/proposals.utils";
  import type { ProposalInfo } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;
  export let disabled: boolean;

  const toggleSelection = (neuronId: bigint) =>
    votingNeuronSelectStore.toggleSelection(neuronId);
</script>

{#if $votingNeuronSelectStore.neurons.length > 0}
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
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  ul {
    list-style: none;
    padding: 0 0 var(--padding-1_5x);

    // checkbox restyling
    --checkbox-padding: var(--padding);

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
