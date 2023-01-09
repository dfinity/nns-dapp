<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import ProposalProposerInfoSection from "./ProposalProposerInfoSection.svelte";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;
  let url: string | undefined;

  $: ({ title, proposal, url } = mapProposalInfo(proposalInfo));
</script>

<ProposalProposerInfoSection {title} summary={proposal?.summary} {url} />
