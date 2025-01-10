<script lang="ts">
  import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
  import NnsVotingCard from "$lib/components/proposal-detail/VotingCard/NnsVotingCard.svelte";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";
  import {
    MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER,
    MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER,
  } from "$lib/constants/proposals.constants";
  import { basisPointsToPercent } from "$lib/utils/utils";
  import { ProposalRewardStatus, type ProposalInfo } from "@dfinity/nns";

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
  // Use default majority proportion values for nns for now
  let immediateMajorityPercent = 0;
  $: immediateMajorityPercent = basisPointsToPercent(
    MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER
  );
  let standardMajorityPercent = 0;
  $: standardMajorityPercent = basisPointsToPercent(
    MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER
  );
</script>

<VotesResults
  {yes}
  {no}
  {total}
  deadlineTimestampSeconds={proposalInfo.deadlineTimestampSeconds}
  {immediateMajorityPercent}
  {standardMajorityPercent}
/>

{#if !settled}
  <NnsVotingCard {proposalInfo} />
{/if}
