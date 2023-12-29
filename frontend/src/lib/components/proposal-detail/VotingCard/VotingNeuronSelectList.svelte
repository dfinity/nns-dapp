<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Checkbox, KeyValuePair } from "@dfinity/gix-components";
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
        <KeyValuePair>
          <span slot="key" class="label">
            <span
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
          </span>
          <span slot="value" class="value">
            <Checkbox
              inputId={neuron.neuronIdString}
              checked={$votingNeuronSelectStore.selectedIds.includes(
                neuron.neuronIdString
              )}
              on:nnsChange={() => toggleSelection(neuron.neuronIdString)}
              {disabled}
            >
              <span
                class="value"
                data-tid="voting-neuron-select-voting-power"
                aria-label={replacePlaceholders(
                  $i18n.proposal_detail__vote.cast_vote_votingPower,
                  {
                    $votingPower: formatVotingPower(neuron.votingPower),
                  }
                )}>{formatVotingPower(neuron.votingPower)}</span
              >
            </Checkbox>
          </span>
        </KeyValuePair>
      </li>
    {/each}
  </ul>
{/if}

<style lang="scss">
  ul {
    list-style: none;
    padding: 0;

    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    margin-top: var(--padding);

    --checkbox-padding: 0;
  }
</style>
