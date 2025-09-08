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

  type Props = {
    proposalInfo: ProposalInfo;
  };
  const { proposalInfo }: Props = $props();

  const rewardStatus = $derived(proposalInfo.rewardStatus);
  const settled = $derived(rewardStatus === ProposalRewardStatus.Settled);
  const yes = $derived(
    Number(proposalInfo?.latestTally?.yes ?? 0) / E8S_PER_ICP
  );
  const no = $derived(Number(proposalInfo?.latestTally?.no ?? 0) / E8S_PER_ICP);
  const total = $derived(
    Number(proposalInfo?.latestTally?.total ?? 0) / E8S_PER_ICP
  );

  // Use default majority proportion values for nns for now
  const immediateMajorityPercent = $derived(
    basisPointsToPercent(MINIMUM_YES_PROPORTION_OF_EXERCISED_VOTING_POWER)
  );
  const standardMajorityPercent = $derived(
    basisPointsToPercent(MINIMUM_YES_PROPORTION_OF_TOTAL_VOTING_POWER)
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
