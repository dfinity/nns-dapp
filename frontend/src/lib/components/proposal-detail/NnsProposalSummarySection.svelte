<script lang="ts">
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import ProposalSummarySection from "./ProposalSummarySection.svelte";
  import type { Proposal } from "@dfinity/nns";
  import type { ProposalInfo } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;
  let url: string | undefined;

  $: ({ title, proposal, url } = mapProposalInfo(proposalInfo));
</script>

<ProposalSummarySection {title} summary={proposal?.summary} {url} />
