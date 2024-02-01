<script lang="ts">
  import { Vote } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    type CompactNeuronInfo,
  } from "$lib/utils/neuron.utils";
  import { getVoteDisplay } from "$lib/utils/proposals.utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
  import VotingCardNeuronList from "$lib/components/proposal-detail/VotingCard/VotingCardNeuronList.svelte";
  import { fade } from "svelte/transition";
  import VoteResultIcon from "$lib/components/proposal-detail/VotingCard/VoteResultIcon.svelte";

  export let neuronsVotedForProposal: CompactNeuronInfo[] = [];

  const voteMapper = ({ neuron, vote }: { neuron: string; vote: Vote }) => {
    return replacePlaceholders($i18n.proposal_detail__vote.vote_status, {
      $neuronId: neuron.toString(),
      $vote: getVoteDisplay(vote),
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
        in:fade
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
            class:rejected={neuron.vote === Vote.No}
            data-tid="my-votes-voting-power"
          >
            <span>{formatVotingPower(neuron.votingPower)}</span>
            <VoteResultIcon vote={neuron.vote} />
          </span>
        </KeyValuePair>
      </li>
    {/each}
  </VotingCardNeuronList>
{/if}

<style lang="scss">
  .vote-details {
    display: flex;
    align-items: center;
    gap: var(--padding);

    color: var(--positive-emphasis);

    &.rejected {
      color: var(--negative-emphasis);
    }
  }
</style>
