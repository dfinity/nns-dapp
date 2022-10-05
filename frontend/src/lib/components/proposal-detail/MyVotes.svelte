<script lang="ts">
  import type { ProposalInfo, NeuronId } from "@dfinity/nns";
  import { Vote } from "@dfinity/nns";
  import { i18n } from "$lib/utils/i18n";
  import { IconThumbDown, IconThumbUp } from "@dfinity/gix-components";
  import { definedNeuronsStore } from "$lib/utils/neurons.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    votedNeuronDetails,
    type CompactNeuronInfo,
  } from "$lib/utils/neuron.utils";
  import Value from "$lib/components/ui/Value.svelte";
  import ProposalContentCell from "./ProposalContentCell.svelte";

  export let proposalInfo: ProposalInfo;

  const voteIconMapper = {
    [Vote.No]: IconThumbDown,
    [Vote.Yes]: IconThumbUp,
    [Vote.Unspecified]: undefined,
  };

  const voteMapper = ({ neuron, vote }: { neuron: NeuronId; vote: Vote }) => {
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

  let neuronsVotedForProposal: CompactNeuronInfo[];
  $: {
    neuronsVotedForProposal = votedNeuronDetails({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    });
  }
</script>

{#if neuronsVotedForProposal.length}
  <ProposalContentCell>
    <h4 slot="start">{$i18n.proposal_detail.my_votes}</h4>
    <ul>
      {#each neuronsVotedForProposal as neuron}
        <li
          data-tid="neuron-data"
          aria-label={voteMapper({ neuron: neuron.id, vote: neuron.vote })}
          title={voteMapper({ neuron: neuron.id, vote: neuron.vote })}
        >
          <p class="value">{neuron.id}</p>
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
  @use "@dfinity/gix-components/styles/mixins/media";

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
