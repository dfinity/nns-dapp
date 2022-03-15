<script lang="ts">
  import type { BallotInfo, NeuronInfo, ProposalId } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";
  import ProposalShortSummary from "../proposals/ProposalShortSummary.svelte";
  import { i18n } from "../../stores/i18n";

  export let neuron: NeuronInfo;

  let proposalIds: ProposalId[];

  const distinctProposalIds = ({ recentBallots }: NeuronInfo): ProposalId[] =>
    Array.from(
      new Set(
        recentBallots
          .filter(({ proposalId }: BallotInfo) => proposalId !== undefined)
          .map(({ proposalId }: BallotInfo) => proposalId as ProposalId)
      )
    );

  $: proposalIds = distinctProposalIds(neuron);
</script>

<!-- TODO(L2-282): add tests -->

<Card>
  <h3 slot="start">{$i18n.neuron_detail.voting_history}</h3>

  <div class="history">
    <h4>{$i18n.proposal_detail.summary}</h4>
    <h4>{$i18n.neuron_detail.vote}</h4>

    {#each proposalIds as proposalId}
      <ProposalShortSummary {proposalId} />
    {/each}
  </div>
</Card>

<style lang="scss">
  .history {
    display: grid;
    grid-template-columns: 80% auto;
    grid-column-gap: var(--padding);
  }
</style>
