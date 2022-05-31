<script lang="ts">
  import Card from "../ui/Card.svelte";
  import type { ProposalInfo } from "@dfinity/nns";
  import { ProposalStatus } from "@dfinity/nns";
  import Badge from "../ui/Badge.svelte";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import type { ProposalColor } from "../../constants/proposals.constants";
  import { proposalsFiltersStore } from "../../stores/proposals.store";
  import { mapProposalInfo, hideProposal } from "../../utils/proposals.utils";
  import type { ProposalId } from "@dfinity/nns";
  import ProposalMeta from "./ProposalMeta.svelte";
  import { definedNeuronsStore } from "../../stores/neurons.store";

  export let proposalInfo: ProposalInfo;
  export let hidden: boolean = false;

  let status: ProposalStatus = ProposalStatus.PROPOSAL_STATUS_UNKNOWN;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let color: ProposalColor | undefined;

  $: ({ status, id, title, color } = mapProposalInfo(proposalInfo));

  const showProposal = () => {
    routeStore.navigate({
      path: `${AppPath.ProposalDetail}/${id}`,
    });
  };

  // HACK:
  //
  // 1. the governance canister does not implement a filter to hide proposals where all neurons have voted or are ineligible.
  // 2. the governance canister interprets queries with empty filter (e.g. topics=[]) has "any" queries and returns proposals anyway. On the contrary, the Flutter app displays nothing if one filter is empty.
  // 3. the Flutter app does not simply display nothing when a filter is empty but re-filter the results provided by the backend.
  //
  // That's why we hide and re-process these proposals delivered by the backend on the client side.
  //
  // We do not filter these types of proposals from the list but "only" hide these because removing them from the list is not compatible with an infinite scroll feature.
  let hide: boolean;
  $: hide = hideProposal({
    filters: $proposalsFiltersStore,
    proposalInfo,
    neurons: $definedNeuronsStore,
  });
</script>

<!-- We hide the card but keep an element in DOM to preserve the infinite scroll feature -->
<li class:hidden>
  {#if !hide}
    <Card role="link" on:click={showProposal} testId="proposal-card">
      <div slot="start" class="title-container">
        <p class="title" {title}>{title}</p>
      </div>
      <Badge slot="end" {color}
        ><span>{$i18n.status[ProposalStatus[status]] ?? ""}</span></Badge
      >

      <ProposalMeta {proposalInfo} size="small" link={false} />
    </Card>
  {/if}
</li>

<style lang="scss">
  @use "../../themes/mixins/text";
  @use "../../themes/mixins/card";
  @use "../../themes/mixins/media.scss";

  li.hidden {
    visibility: hidden;
  }

  .title-container {
    @include card.stacked-title;
  }

  .title {
    @include text.clamp(3);

    @include media.min-width(small) {
      margin: 0 var(--padding-2x) 0 0;
    }
  }
</style>
