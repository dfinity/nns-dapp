<script lang="ts">
  import {
    ineligibleNeurons as filterIneligibleNeurons,
    ProposalInfo,
    NeuronInfo,
  } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Card from "../ui/Card.svelte";

  export let proposalInfo: ProposalInfo;
  export let neurons: NeuronInfo[];

  let ineligibleNeurons: NeuronInfo[] = [];
  let visible: boolean = false;

  $: ineligibleNeurons = filterIneligibleNeurons({
    neurons,
    proposal: proposalInfo,
  });
  $: visible = ineligibleNeurons.length > 0;

  const reason = (neuron: NeuronInfo): string =>
    neuron.createdTimestampSeconds > proposalInfo.proposalTimestampSeconds
      ? $i18n.proposal_detail__ineligible.reason_after
      : $i18n.proposal_detail__ineligible.reason_short;
</script>

{#if visible}
  <Card>
    <h3>{$i18n.proposal_detail__ineligible.headline}</h3>
    <p>{$i18n.proposal_detail__ineligible.headline}</p>

    <ul>
      {#each ineligibleNeurons as neuron}
        <li>
          {neuron.neuronId}<small>{reason(neuron)}</small>
        </li>
      {/each}
    </ul>
  </Card>
{/if}

<style lang="scss">
</style>
