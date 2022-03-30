<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { Proposal, ProposalInfo } from "@dfinity/nns";
  import { ProposalStatus } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import { PROPOSAL_COLOR } from "../../constants/proposals.constants";
  import type { ProposalColor } from "../../constants/proposals.constants";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import { hideProposal } from "../../utils/proposals.utils";
  import type { ProposalId } from "@dfinity/nns";
  import Proposer from "./Proposer.svelte";

  export let proposalInfo: ProposalInfo;

  let proposal: Proposal | undefined;
  let status: ProposalStatus = ProposalStatus.PROPOSAL_STATUS_UNKNOWN;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let color: ProposalColor | undefined;

  $: ({ proposal, status, id } = proposalInfo);
  $: title = proposal?.title ?? "";
  $: color = PROPOSAL_COLOR[status];

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${id}`,
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
    <Card role="link" on:click={showProposal}>
      <div slot="start" class="title-container">
        <p class="title" {title}>{title}</p>
      </div>
      <Badge slot="end" {color}
        ><span>{$i18n.status[ProposalStatus[status]] ?? ""}</span></Badge
      >

      <p class="info"><Proposer {proposalInfo} /></p>
      <p class="info"><small>Id: {id ?? ""}</small></p>
    </Card>
  {/if}
</div>

<style lang="scss">
  @use "../../themes/mixins/text";
  @use "../../themes/mixins/card";
  @use "../../themes/mixins/media.scss";

  .title-container {
    @include card.stacked-title;
  }

  .title {
    @include text.clamp(3);

    @include media.min-width(small) {
      margin: 0 calc(2 * var(--padding)) 0 0;
    }
  }

  .info {
    margin: 0;
  }
</style>
