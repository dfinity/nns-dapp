<script lang="ts">
  import type { SnsProposalData } from "@dfinity/sns";
  import SnsVotingCard from "$lib/components/sns-proposals/SnsVotingCard.svelte";

  export let proposal: SnsProposalData;
</script>

<div class="content-cell-island">
  TODO: add VotesResults

  <!--  TODO: check {#if !settled} logic for sns-->
  <SnsVotingCard {proposal} />
</div>
