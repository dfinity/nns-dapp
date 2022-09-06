<script lang="ts">
  import type { ProposalInfo, NeuronId } from "@dfinity/nns";
  import { Vote } from "@dfinity/nns";
  import CardInfo from "../ui/CardInfo.svelte";
  import { i18n } from "../../stores/i18n";
  import IconThumbDown from "../../icons/IconThumbDown.svelte";
  import IconThumbUp from "../../icons/IconThumbUp.svelte";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import {
    formatVotingPower,
    votedNeuronDetails,
    type CompactNeuronInfo,
  } from "../../utils/neuron.utils";
  import Value from "../ui/Value.svelte";
  import type { SvelteComponent } from "svelte";
  import { VOTING_UI } from "../../constants/environment.constants";
  import ContentCell from "../ui/ContentCell.svelte";

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

  // TODO(L2-965): delete legacy component <CardInfo />, inline styles (.content-cell-title and .content-cell-details) and delete ContentCell
  let cmp: typeof SvelteComponent =
    VOTING_UI === "legacy" ? CardInfo : ContentCell;
</script>

<svelte:component this={cmp}>
  {#if neuronsVotedForProposal.length}
    <h2 class="my-votes">{$i18n.proposal_detail.my_votes}</h2>
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
  {/if}
</svelte:component>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .my-votes {
    padding-top: var(--padding-3x);
  }

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
