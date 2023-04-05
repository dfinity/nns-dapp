<script lang="ts">
  import type { SnsProposalData, SnsTally } from "@dfinity/sns";
  import SnsVotingCard from "$lib/components/sns-proposals/SnsVotingCard.svelte";
  import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
  import { fromDefinedNullable } from "@dfinity/utils";

  export let proposal: SnsProposalData;

  let tally: SnsTally;
  $: tally = fromDefinedNullable(proposal.latest_tally);
</script>

<div
  class="content-cell-island"
  data-tid="sns-proposal-voting-section-component"
>
  <VotesResults
    yes={Number(tally.yes)}
    no={Number(tally.no)}
    total={Number(tally.total)}
  />

  <!--  TODO: check {#if !settled} logic for sns-->
  <SnsVotingCard {proposal} />
</div>
