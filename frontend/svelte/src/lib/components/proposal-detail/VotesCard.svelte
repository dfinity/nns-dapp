<script lang="ts">
  import type { ProposalInfo, NeuronId } from "@dfinity/nns";
  import { Vote } from "@dfinity/nns";
  import CardStatic from "../ui/CardStatic.svelte";
  import { i18n } from "../../stores/i18n";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { formatNumber } from "../../utils/format.utils";
  import IconThumbDown from "../../icons/IconThumbDown.svelte";
  import IconThumbUp from "../../icons/IconThumbUp.svelte";
  import { votedNeurons } from "@dfinity/nns";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";

  export let proposalInfo: ProposalInfo;

  let yes: number;
  let no: number;
  let sum: number;

  $: yes = Number(proposalInfo?.latestTally?.yes ?? 0) / E8S_PER_ICP;
  $: no = Number(proposalInfo?.latestTally?.no ?? 0) / E8S_PER_ICP;
  $: sum = yes + no;

  type CompactNeuronInfo = {
    id: NeuronId;
    votingPower: number;
    vote: Vote;
  };
  const voteIconMapper = {
    [Vote.NO]: IconThumbDown,
    [Vote.YES]: IconThumbUp,
    [Vote.UNSPECIFIED]: undefined,
  };

  let neuronsVotedForProposal: CompactNeuronInfo[];

  const voteMapper = ({ neuron, vote }: { neuron: NeuronId; vote: Vote }) => {
    const stringMapper = {
      [Vote.NO]: $i18n.core.no,
      [Vote.YES]: $i18n.core.yes,
      [Vote.UNSPECIFIED]: "",
    };

    return replacePlaceholders($i18n.proposal_detail__vote.vote_status, {
      $neuronId: neuron.toString(),
      $vote: stringMapper[vote],
    });
  };

  $: {
    neuronsVotedForProposal = votedNeurons({
      neurons: $definedNeuronsStore,
      proposal: proposalInfo,
    })
      .map(({ neuronId, recentBallots, votingPower }) => ({
        id: neuronId,
        // TODO: replace w/ formatVotingPower()
        votingPower: Number(votingPower) / E8S_PER_ICP,
        vote: recentBallots.find(
          ({ proposalId }) => proposalId === proposalInfo.id
        )?.vote,
      }))
      // Exclude the cases where the vote was not found.
      .filter(
        (compactNeuronInfoMaybe) => compactNeuronInfoMaybe.vote !== undefined
      ) as CompactNeuronInfo[];
  }
</script>

<CardStatic>
  <div class="latest-tally">
    <h3>
      {$i18n.proposal_detail.adopt}<span>{formatNumber(yes)}</span>
    </h3>
    <div
      class="progressbar"
      role="progressbar"
      aria-valuenow={yes}
      aria-valuemin={0}
      aria-valuemax={sum}
    >
      <div class="progressbar-value" style="width: {(yes / sum) * 100}%" />
    </div>
    <h3>
      {$i18n.proposal_detail.reject}<span>{formatNumber(no)}</span>
    </h3>
  </div>

  {#if neuronsVotedForProposal.length}
    <h3 class="my-votes">{$i18n.proposal_detail.my_votes}</h3>
    <ul>
      {#each neuronsVotedForProposal as neuron}
        <li
          data-tid="neuron-data"
          aria-label={voteMapper({ neuron: neuron.id, vote: neuron.vote })}
          title={voteMapper({ neuron: neuron.id, vote: neuron.vote })}
        >
          <p>{neuron.id}</p>
          <p class="vote-details">
            <span>{neuron.votingPower}</span>
            {#if voteIconMapper[neuron.vote]}
              <svelte:component this={voteIconMapper[neuron.vote]} />
            {/if}
          </p>
        </li>
      {/each}
    </ul>
  {/if}
</CardStatic>

<style lang="scss">
  @use "../../themes/mixins/media";

  .latest-tally {
    display: grid;

    grid-template-columns: 110px 1fr 110px;
    align-items: center;
    height: var(--headless-layout-header-height);

    @include media.min-width(medium) {
      grid-template-columns: 130px 1fr 130px;
    }

    h3 {
      font-size: var(--font-size-h4);
      line-height: var(--line-height-standard);
      text-align: center;

      @include media.min-width(medium) {
        font-size: var(--font-size-h3);
      }

      span {
        display: block;
        text-align: center;
        font-size: var(--font-size-small);

        @include media.min-width(medium) {
          font-size: var(--font-size-h5);
        }
      }
    }

    .progressbar {
      position: relative;
      height: 10px;
      background: var(--pink);

      .progressbar-value {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;

        background: var(--blue-200-shade);
      }
    }
  }

  .my-votes {
    padding-top: var(--padding);
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
