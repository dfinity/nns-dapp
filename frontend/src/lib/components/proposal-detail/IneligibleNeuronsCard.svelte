<script lang="ts">
  import { ineligibleNeurons as filterIneligibleNeurons } from "@dfinity/nns";
  import type { ProposalInfo, NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import ProposalContentCell from "./ProposalContentCell.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let ineligibleNeurons: NeuronInfo[];
  let visible = false;

  $: ineligibleNeurons = filterIneligibleNeurons({
    neurons,
    proposal: proposalInfo,
  });
  $: visible = ineligibleNeurons.length > 0;

  const reason = ({ createdTimestampSeconds }: NeuronInfo): string =>
    createdTimestampSeconds > proposalInfo.proposalTimestampSeconds
      ? $i18n.proposal_detail__ineligible.reason_since
      : $i18n.proposal_detail__ineligible.reason_short;
</script>

{#if visible}
  <ProposalContentCell>
    <h4 slot="start">{$i18n.proposal_detail__ineligible.headline}</h4>
    <p class="description">{$i18n.proposal_detail__ineligible.text}</p>
    <ul>
      {#each ineligibleNeurons as neuron}
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
