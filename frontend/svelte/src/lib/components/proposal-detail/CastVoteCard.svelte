<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";

  export let proposalInfo: ProposalInfo;
</script>

<!-- TODO: implement CastVoteWidget -- https://dfinity.atlassian.net/browse/L2-281 -->
<!-- if (notVotedNeurons.isNotEmpty && latestProposal.status == ProposalStatus.Open) -->
<!-- CastVoteWidget(proposal: latestProposal, neurons: notVotedNeurons) -->
<Card>
  <h3 slot="title">Cast Vote</h3>
  neurons voting power
  <!-- ...widget.neurons.map((n)  -->
  <!-- 'You are about to cast $numVotes votes against this proposal, are you sure you want to proceed? ' -->
  total
</Card>

<style lang="scss">
</style>
