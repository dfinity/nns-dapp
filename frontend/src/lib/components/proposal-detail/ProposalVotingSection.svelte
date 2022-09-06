<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import VotesCard from "./VotesCard.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";

  export let proposalInfo: ProposalInfo;
</script>

<VotesCard {proposalInfo} />
<VotingCard {proposalInfo} />
