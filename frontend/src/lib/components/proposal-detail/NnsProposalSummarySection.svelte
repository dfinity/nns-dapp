<script lang="ts">
  import ProposalSummarySection from "$lib/components/proposal-detail/ProposalSummarySection.svelte";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;
  let url: string | undefined;

  $: ({ title, proposal, url } = mapProposalInfo(proposalInfo));
</script>

<ProposalSummarySection {title} summary={proposal?.summary} {url} />
