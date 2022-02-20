<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import { ProposalStatus } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import { PROPOSAL_COLOR } from "../../constants/proposals.constants";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let status: ProposalStatus | undefined;

  let color: "warning" | "success" | undefined;

  $: ({ proposal, status } = proposalInfo);

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${proposalInfo.id}`,
    });
  };

  $: color = PROPOSAL_COLOR[status];
</script>

<!-- TODO(L2-206): display all proposal information as in production -->
<!-- TODO(L2-206): implement missing css styles - design -->

<Card on:click={showProposal}>
  <p slot="start">{proposal?.title}</p>
  <Badge slot="end" {color}
    >{status ? $i18n.status[ProposalStatus[status]] : ""}</Badge
  >
</Card>
