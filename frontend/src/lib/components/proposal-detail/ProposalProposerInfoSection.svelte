<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import ProposalSummary from "./ProposalDetailCard/ProposalSummary.svelte";
  import type { Proposal } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  export let proposal: Proposal | undefined;

  $: ({ title, proposal } = mapProposalInfo(proposalInfo));
</script>

<h2 class="content-cell-title">{title ?? ""}</h2>

<div class="content-cell-details">
  <ProposalSummary {proposal} />
</div>
