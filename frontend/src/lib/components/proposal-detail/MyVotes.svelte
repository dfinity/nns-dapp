<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import VotingPowerDisplay from "$lib/components/ic/VotingPowerDisplay.svelte";
  import VoteResultIcon from "$lib/components/proposal-detail/VotingCard/VoteResultIcon.svelte";
  import VotingCardNeuronList from "$lib/components/proposal-detail/VotingCard/VotingCardNeuronList.svelte";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";
  import { i18n } from "$lib/stores/i18n";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { CompactNeuronInfo } from "$lib/utils/neuron.utils";
  import { getVoteDisplay } from "$lib/utils/proposals.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { Vote } from "@dfinity/nns";
  import { fade } from "svelte/transition";

  export let neuronsVotedForProposal: CompactNeuronInfo[] = [];

  const voteMapper = ({ neuron, vote }: { neuron: string; vote: Vote }) => {
    return replacePlaceholders($i18n.proposal_detail__vote.vote_status, {
      $neuronId: neuron.toString(),
      $vote: getVoteDisplay(vote),
    });
  };
</script>

<TestIdWrapper testId="my-votes-component">
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
            <span
              slot="key"
              class="value"
              data-tid="neuron-id"
              title={neuron.idString}
            >
              {shortenWithMiddleEllipsis(
                neuron.idString,
                SNS_NEURON_ID_DISPLAY_LENGTH
              )}
            </span>
            <span
              slot="value"
              class="vote-details"
              class:rejected={neuron.vote === Vote.No}
            >
              <VotingPowerDisplay
                valueTestId="my-votes-voting-power"
                votingPowerE8s={neuron.votingPower}
              />
              <VoteResultIcon vote={neuron.vote} />
            </span>
          </KeyValuePair>
        </li>
      {/each}
    </VotingCardNeuronList>
  {/if}
</TestIdWrapper>

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
