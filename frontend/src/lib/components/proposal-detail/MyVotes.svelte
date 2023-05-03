<script lang="ts">
  import { Vote } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { IconThumbDown, IconThumbUp, Value } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    type CompactNeuronInfo,
  } from "$lib/utils/neuron.utils";
  import ProposalContentCell from "./ProposalContentCell.svelte";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { SNS_NEURON_ID_DISPLAY_LENGTH } from "$lib/constants/sns-neurons.constants";

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
  <ProposalContentCell>
    <h4 slot="start">{$i18n.proposal_detail.my_votes}</h4>
    <ul>
      {#each neuronsVotedForProposal as neuron}
        <li
          data-tid="neuron-data"
          aria-label={voteMapper({
            neuron: neuron.idString,
            vote: neuron.vote,
          })}
          title={voteMapper({ neuron: neuron.idString, vote: neuron.vote })}
        >
          <p class="value">
            {shortenWithMiddleEllipsis(
              neuron.neuronIdString,
              SNS_NEURON_ID_DISPLAY_LENGTH
            )}
          </p>
          <p class="vote-details">
            <Value>{formatVotingPower(neuron.votingPower)}</Value>
            {#if voteIconMapper[neuron.vote]}
              <svelte:component this={voteIconMapper[neuron.vote]} />
            {/if}
          </p>
        </li>
      {/each}
    </ul>
  </ProposalContentCell>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;

    .vote-details {
      display: flex;
      align-items: center;
      gap: var(--padding);
    }
  }
</style>
