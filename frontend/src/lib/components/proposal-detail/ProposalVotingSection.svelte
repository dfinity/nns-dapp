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
  $: total = yes + no;
</script>

<div class="content-cell-island">
  <VotesResults {yes} {no} {total} />

  {#if !settled}
    <VotingCard {proposalInfo} />
  {/if}
</div>
