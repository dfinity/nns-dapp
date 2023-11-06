<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import VotesResults from "./VotesResults.svelte";
  import VotingCard from "./VotingCard/VotingCard.svelte";
  import { ProposalRewardStatus } from "@dfinity/nns";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";

  export let proposalInfo: ProposalInfo;

  let rewardStatus: ProposalRewardStatus;
  $: ({ rewardStatus } = proposalInfo);

  let settled: boolean;
  $: settled = rewardStatus === ProposalRewardStatus.Settled;

  let yes: number;
  $: yes = Number(proposalInfo?.latestTally?.yes ?? 0) / E8S_PER_ICP;
  let no: number;
  $: no = Number(proposalInfo?.latestTally?.no ?? 0) / E8S_PER_ICP;
  let total: number;
  $: total = Number(proposalInfo?.latestTally?.total ?? 0) / E8S_PER_ICP;
</script>

<VotesResults
  {yes}
  {no}
  {total}
  deadlineTimestampSeconds={proposalInfo.deadlineTimestampSeconds}
/>

{#if !settled}
  <VotingCard {proposalInfo} />
{/if}
