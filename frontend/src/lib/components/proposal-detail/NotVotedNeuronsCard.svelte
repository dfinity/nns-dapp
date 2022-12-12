<script lang="ts">
  import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
  import {
    ineligibleNeurons,
    notVotedNeurons,
    ProposalRewardStatus,
  } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import ProposalContentCell from "./ProposalContentCell.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let rewardStatus: ProposalRewardStatus;
  $: ({ rewardStatus } = proposalInfo);

  let settled: boolean;
  $: settled = rewardStatus === ProposalRewardStatus.Settled;

  // If a proposal has settled, its ballots are empty and archived. Therefore, ineligibility cannot be determined and, the not voted neurons are displayed instead.
  let filterNeurons: (params: {
    neurons: NeuronInfo[];
    proposal: ProposalInfo;
  }) => NeuronInfo[];
  $: filterNeurons = settled ? notVotedNeurons : ineligibleNeurons;

  let filteredNeurons: NeuronInfo[];
  $: filteredNeurons = filterNeurons({
    neurons,
    proposal: proposalInfo,
  });

  let visible = false;
  $: visible = filteredNeurons.length > 0;

  const reason = ({ createdTimestampSeconds }: NeuronInfo): string =>
    settled
      ? $i18n.proposal_detail__ineligible.reason_settled
      : createdTimestampSeconds > proposalInfo.proposalTimestampSeconds
      ? $i18n.proposal_detail__ineligible.reason_since
      : $i18n.proposal_detail__ineligible.reason_short;

  let description: string;
  $: description = settled
    ? $i18n.proposal_detail__ineligible.text_settled
    : $i18n.proposal_detail__ineligible.text;
</script>

{#if visible}
  <ProposalContentCell>
    <h4 slot="start">{$i18n.proposal_detail__ineligible.headline}</h4>
    <p class="description">{description}</p>
    <ul>
      {#each filteredNeurons as neuron}
        <li class="value">
          {neuron.neuronId}<small>{reason(neuron)}</small>
        </li>
      {/each}
    </ul>
  </ProposalContentCell>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin: var(--padding-2x) 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @include media.min-width(small) {
      flex-direction: row;
      align-items: center;
    }

    small {
      font-size: var(--font-size-small);
    }
  }
</style>
