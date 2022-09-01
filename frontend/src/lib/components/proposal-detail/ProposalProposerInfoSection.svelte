<script lang="ts">
  import type { ProposalInfo } from "@dfinity/nns";
  import { mapProposalInfo } from "../../utils/proposals.utils";
  import ProposalSummary from "./ProposalDetailCard/ProposalSummary.svelte";
  import type { Proposal } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";

  export let proposalInfo: ProposalInfo;

  let title: string | undefined;
  let proposal: Proposal | undefined;

  $: ({ title, proposal } = mapProposalInfo(proposalInfo));
</script>

<h2 class="content-cell-title" data-tid="proposal-proposer-info-title">
  {$i18n.proposal_detail.summary}
</h2>

<div class="content-cell-details">
  <ProposalSummary {proposal}>
    <svelte:fragment slot="title">{title ?? ""}</svelte:fragment>
  </ProposalSummary>
</div>

<style lang="scss">
  .content-cell-details {
    background: var(--line);
    padding: var(--padding-2x);
    border-radius: var(--border-radius);
  }
</style>
