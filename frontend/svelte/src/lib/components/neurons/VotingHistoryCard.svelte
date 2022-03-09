<script lang="ts">
  import type { BallotInfo, NeuronInfo, ProposalId } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";
  import ProposalShortSummary from "../proposals/ProposalShortSummary.svelte";

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

<Card>
  {#each proposalIds as proposalId}
    <ProposalShortSummary {proposalId} />
  {/each}
</Card>
