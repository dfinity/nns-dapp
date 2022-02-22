<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import { ProposalStatus } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import { i18n } from "../../stores/i18n";

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
</script>

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
