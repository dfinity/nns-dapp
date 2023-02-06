<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import VotesResults from "./VotesResults.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";
  import { ProposalRewardStatus } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;

  let rewardStatus: ProposalRewardStatus;
  $: ({ rewardStatus } = proposalInfo);

  let settled: boolean;
  $: settled = rewardStatus === ProposalRewardStatus.Settled;
</script>

<div class="content-cell-island">
  <VotesResults {proposalInfo} />

  {#if !settled}
    <VotingCard {proposalInfo} />
  {/if}
</div>
