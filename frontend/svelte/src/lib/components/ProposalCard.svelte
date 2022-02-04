<script lang="ts">
  import Card from "./ui/Card.svelte";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import Badge from "./Badge.svelte";
  import { ProposalStatus } from "@dfinity/nns";

  export let proposalInfo!: ProposalInfo;

  let proposal!: Proposal;
  let status!: ProposalStatus;

  $: ({ proposal, status } = proposalInfo);

  // TODO: integrate ProposalStatus
</script>

<Card>
  <p slot="start">{proposal.title}</p>
  <Badge slot="end">{status}</Badge>
</Card>
