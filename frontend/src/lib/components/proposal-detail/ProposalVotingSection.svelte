<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import VotesResults from "./VotesResults.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";

  export let proposalInfo: ProposalInfo;
</script>

<div class="content-cell-island">
  <VotesResults {proposalInfo} />
  <VotingCard {proposalInfo} />
</div>
