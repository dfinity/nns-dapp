<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import { ProposalStatus, Vote } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import { i18n } from "../../stores/i18n";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import { hideProposal } from "../../utils/proposals.utils";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let status: ProposalStatus | undefined;

  let color: "warning" | "success" | undefined;

  $: ({ proposal, status } = proposalInfo);

  const colors: Record<string, "warning" | "success" | undefined> = {
    [ProposalStatus.PROPOSAL_STATUS_EXECUTED]: "success",
    [ProposalStatus.PROPOSAL_STATUS_OPEN]: "warning",
    [ProposalStatus.PROPOSAL_STATUS_UNKNOWN]: undefined,
    [ProposalStatus.PROPOSAL_STATUS_REJECTED]: undefined,
    [ProposalStatus.PROPOSAL_STATUS_ACCEPTED]: undefined,
    [ProposalStatus.PROPOSAL_STATUS_FAILED]: undefined,
  };

  $: color = colors[status];

  // HACK: the governance canister does not implement a filter to hide proposals where all neurons have voted or are ineligible.
  // That's why we hide these proposals on the client side only.
  // We do not filter these types of proposals from the list but "only" hide these because removing them from the list is not compatible with an infinite scroll feature.
  let hide: boolean;
  $: hide = hideProposal({
    excludeVotedProposals: $proposalsFiltersStore.excludeVotedProposals,
    proposalInfo,
  });
</script>

<!-- We hide the card but keep an element in DOM to preserve the infinite scroll feature -->
<div>
  {#if !hide}
    <Card>
      <p slot="start">{proposal?.title}</p>
      <Badge slot="end" {color}
        >{status ? $i18n.status[ProposalStatus[status]] : ""}</Badge
      >

      <div>
        <p><small>Proposer: {proposalInfo?.proposer || ''}</small></p>
        <p><small>Id: {proposalInfo?.id || ''}</small></p>
      </div>
    </Card>
  {/if}
</div>
