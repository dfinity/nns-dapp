<script lang="ts">
  import { Vote } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    IconThumbDown,
    IconThumbUp,
    KeyValuePair,
    Value,
  } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    type CompactNeuronInfo,
  } from "$lib/utils/neuron.utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
  import VotingCardNeuronList from "$lib/components/proposal-detail/VotingCard/VotingCardNeuronList.svelte";

  export let neuronsVotedForProposal: CompactNeuronInfo[] = [];

  const voteIconMapper = {
    [Vote.No]: IconThumbDown,
    [Vote.Yes]: IconThumbUp,
    [Vote.Unspecified]: undefined,
  };

  const voteMapper = ({ neuron, vote }: { neuron: string; vote: Vote }) => {
    const stringMapper = {
      [Vote.No]: $i18n.core.no,
      [Vote.Yes]: $i18n.core.yes,
      [Vote.Unspecified]: "",
    };

    return replacePlaceholders($i18n.proposal_detail__vote.vote_status, {
      $neuronId: neuron.toString(),
      $vote: stringMapper[vote],
    });
  };
</script>

{#if neuronsVotedForProposal.length}
  <VotingCardNeuronList>
    {#each neuronsVotedForProposal as neuron}
      <li
        data-tid="neuron-data"
        aria-label={voteMapper({
          neuron: neuron.idString,
          vote: neuron.vote,
        })}
        title={voteMapper({ neuron: neuron.idString, vote: neuron.vote })}
      >
        <KeyValuePair>
          <span slot="key" class="value" title={neuron.idString}>
            {shortenWithMiddleEllipsis(
              neuron.idString,
              SNS_NEURON_ID_DISPLAY_LENGTH
            )}
          </span>
          <span
            slot="value"
            class="vote-details"
            data-tid="my-votes-voting-power"
          >
            <Value>{formatVotingPower(neuron.votingPower)}</Value>
            {#if voteIconMapper[neuron.vote]}
              <svelte:component this={voteIconMapper[neuron.vote]} />
            {/if}
          </span>
        </KeyValuePair>
      </li>
    {/each}
  </VotingCardNeuronList>
{/if}
