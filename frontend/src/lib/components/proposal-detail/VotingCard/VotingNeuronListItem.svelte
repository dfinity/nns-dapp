<script lang="ts">
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
  import VotingPowerDisplay from "$lib/components/ic/VotingPowerDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
  import type { VotingNeuron } from "$lib/types/proposals";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { Checkbox, KeyValuePair } from "@dfinity/gix-components";
  import { fade } from "svelte/transition";

  export let neuron: VotingNeuron;
  export let disabled: boolean;
  export let toggleSelection: (neuronId: string) => void;
</script>

<li in:fade data-tid="voting-neuron-list-item-component">
  <KeyValuePair>
    <span slot="key" class="label">
      <span
        data-tid="neuron-id"
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
        <VotingPowerDisplay
          valueTestId="voting-neuron-select-voting-power"
          valueAriaLabel={replacePlaceholders(
            $i18n.proposal_detail__vote.cast_vote_votingPower,
            {
              $votingPower: formatVotingPower(neuron.votingPower),
            }
          )}
          votingPowerE8s={neuron.votingPower}
        />
      </Checkbox>
    </span>
  </KeyValuePair>
</li>
