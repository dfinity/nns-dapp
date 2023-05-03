<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Checkbox } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";

  export let disabled: boolean;

  const toggleSelection = (neuronId: string) =>
    votingNeuronSelectStore.toggleSelection(neuronId);
</script>

{#if $votingNeuronSelectStore.neurons.length > 0}
  <ul>
    {#each $votingNeuronSelectStore.neurons as neuron}
      <li>
        <Checkbox
          inputId={neuron.neuronIdString}
          checked={$votingNeuronSelectStore.selectedIds.includes(
            neuron.neuronIdString
          )}
          on:nnsChange={() => toggleSelection(neuron.neuronIdString)}
          text="block"
          {disabled}
        >
          <span
            class="neuron-id value"
            aria-label={replacePlaceholders(
              $i18n.proposal_detail__vote.cast_vote_neuronId,
              {
                $neuronId: neuron.neuronIdString,
              }
            )}
            title={neuron.neuronIdString}
            >{shortenWithMiddleEllipsis(
              neuron.neuronIdString,
              SNS_NEURON_ID_DISPLAY_LENGTH
            )}</span
          >
          <span
            class="voting-power value"
            aria-label={replacePlaceholders(
              $i18n.proposal_detail__vote.cast_vote_votingPower,
              {
                $votingPower: formatVotingPower(neuron.votingPower),
              }
            )}>{formatVotingPower(neuron.votingPower)}</span
          >
        </Checkbox>
      </li>
    {/each}
  </ul>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  ul {
    list-style: none;
    padding: var(--padding-1_5x) 0;

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
