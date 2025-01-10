<script lang="ts">
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import ProposalSummarySection from "$lib/components/proposal-detail/ProposalSummarySection.svelte";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;
  let url: string | undefined;

  $: ({ title, proposal, url } = mapProposalInfo(proposalInfo));
</script>

<ProposalSummarySection {title} summary={proposal?.summary} {url} />
