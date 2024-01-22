<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";
  import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import type { IneligibleNeuronData } from "$lib/utils/neuron.utils";

  export let ineligibleNeurons: IneligibleNeuronData[] = [];
  export let minSnsDissolveDelaySeconds: bigint;

  let ineligibleNeuronCount: number;
  $: ineligibleNeuronCount = ineligibleNeurons.length;
</script>

{#if ineligibleNeuronCount > 0}
  <ExpandableProposalNeurons testId="ineligible-neurons">
    <svelte:fragment slot="start">
      {replacePlaceholders(
        ineligibleNeuronCount > 1
          ? $i18n.proposal_detail__ineligible.headline_plural
          : $i18n.proposal_detail__ineligible.headline,
        {
          $count: `${ineligibleNeuronCount}`,
        }
      )}
    </svelte:fragment>
    <IneligibleNeuronsCard {ineligibleNeurons} {minSnsDissolveDelaySeconds} />
  </ExpandableProposalNeurons>
{/if}
