<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import ExpandableProposalNeurons from "$lib/components/proposal-detail/VotingCard/ExpandableProposalNeurons.svelte";
  import IneligibleNeuronsCard from "$lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
  import type { IneligibleNeuronData } from "$lib/utils/neuron.utils";

  export let ineligibleNeurons: IneligibleNeuronData[] = [];
  export let ineligibleNeuronCount: number;
  export let minSnsDissolveDelaySeconds: bigint;
</script>

{#if ineligibleNeuronCount > 0}
  <ExpandableProposalNeurons testId="ineligible-neurons">
    <svelte:fragment slot="start">
      {replacePlaceholders($i18n.proposal_detail__ineligible.headline, {
        $count: `${ineligibleNeuronCount}`,
      })}
    </svelte:fragment>
    <IneligibleNeuronsCard {ineligibleNeurons} {minSnsDissolveDelaySeconds} />
  </ExpandableProposalNeurons>
{/if}
