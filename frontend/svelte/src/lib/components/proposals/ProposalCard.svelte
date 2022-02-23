<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import { ProposalStatus } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import {
    ProposalColor,
    PROPOSAL_COLOR,
  } from "../../constants/proposals.constants";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import { hideProposal } from "../../utils/proposals.utils";

  // TODO: nns-js in v0.2.2 does not expose types yet - solved in https://github.com/dfinity/nns-js/pull/43
  // import type { NeuronId, ProposalId } from "@dfinity/nns";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let status: ProposalStatus | undefined;
  let proposer: bigint | undefined;
  let id: bigint | undefined;
  let title: string | undefined;

  let color: ProposalColor;

  $: ({ proposal, status, proposer, id } = proposalInfo);
  $: ({ title } = proposal);
  $: color = PROPOSAL_COLOR[status];

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${proposalInfo.id}`,
    });
  };

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
      <p slot="start" class="title" {title}>{title || ""}</p>
      <Badge slot="end" {color}
        >{status ? $i18n.status[ProposalStatus[status]] : ""}</Badge
      >

      <p><small>Proposer: {proposer || ""}</small></p>
      <p><small>Id: {id || ""}</small></p>
    </Card>
  {/if}
</div>

<Card on:click={showProposal}>
  <p slot="start">{proposal?.title}</p>
  <Badge slot="end" {color}
    >{status ? $i18n.status[ProposalStatus[status]] : ""}</Badge
  >
</Card>

<style lang="scss">
  @use "../../themes/mixins/text";

  .title {
    @include text.clamp(3);
    margin: 0 var(--padding) 0 0;
  }
</style>
