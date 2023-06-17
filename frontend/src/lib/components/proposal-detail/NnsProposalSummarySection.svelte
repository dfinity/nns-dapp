<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import ProposalSummarySection from "./ProposalSummarySection.svelte";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;
  let url: string | undefined;

  $: ({ title, proposal, url } = mapProposalInfo(proposalInfo));
</script>

<ProposalSummarySection {title} summary={proposal?.summary} {url} />
