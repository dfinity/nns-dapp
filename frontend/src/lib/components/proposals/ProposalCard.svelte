<script lang="ts">
  import { Card } from "@dfinity/gix-components";
  import type { ProposalInfo } from "@dfinity/nns";
  import { type NeuronId, ProposalStatus } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../constants/routes.constants";
  import {
    proposalsFiltersStore,
    type ProposalsFiltersStore,
  } from "../../stores/proposals.store";
  import { mapProposalInfo, hideProposal } from "../../utils/proposals.utils";
  import type { ProposalId } from "@dfinity/nns";
  import ProposalMeta from "./ProposalMeta.svelte";
  import { definedNeuronsStore } from "../../stores/neurons.store";
  import type { Color } from "../../types/theme";
  import Tag from "../ui/Tag.svelte";
  import { voteInProgressStore } from "../../stores/voting.store";

  export let proposalInfo: ProposalInfo;
  export let hidden: boolean = false;
  export let layout: "modern" | "legacy" = "legacy";
  import Value from "../ui/Value.svelte";

  let status: ProposalStatus = ProposalStatus.PROPOSAL_STATUS_UNKNOWN;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let color: Color | undefined;

  let topic: string | undefined;
  let proposer: NeuronId | undefined;
  let type: string | undefined;

  $: ({ status, id, title, color, topic, proposer, type } =
    mapProposalInfo(proposalInfo));

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
  $: hide =
    hideProposal({
      filters: $proposalsFiltersStore as ProposalsFiltersStore,
      proposalInfo,
      neurons: $definedNeuronsStore,
    }) ||
    // hide proposals that are currently in the voting state
    $voteInProgressStore.votes.find(
      ({ proposalId }) => proposalInfo.id === proposalId
    ) !== undefined;
</script>

<!-- We hide the card but keep an element in DOM to preserve the infinite scroll feature -->
<li class:hidden>
  {#if !hide}
    {#if layout === "legacy"}
      <Card role="link" on:click={showProposal} testId="proposal-card">
        <div slot="start" class="title-container">
          <p class="title" {title}>{title}</p>
        </div>
        <Tag slot="end" {color}
          >{$i18n.status[ProposalStatus[status]] ?? ""}</Tag
        >

        <ProposalMeta {proposalInfo} showTopic />
      </Card>
    {:else}
      <Card
        role="link"
        on:click={showProposal}
        testId="proposal-card"
        withArrow={true}
      >
        <div class="card-meta">
          <Value ariaLabel={$i18n.proposal_detail.id_prefix}>{id}</Value>
          <Value ariaLabel={$i18n.proposal_detail.type_prefix}>{type}</Value>
        </div>

        <div class="card-meta">
          <span>{$i18n.proposal_detail.topic_prefix}</span>
          <Value>{topic ?? ""}</Value>
        </div>

        {#if proposer !== undefined}
          <div class="card-meta">
            <span>{$i18n.proposal_detail.proposer_prefix}</span>
            <Value>{proposer}</Value>
          </div>
        {/if}

        <p class="title-placeholder description">{title}</p>

        <p class={`${color} status`}>{$i18n.status[ProposalStatus[status]] ?? ""}</p>
      </Card>
    {/if}
  {/if}
</li>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/text";
  @use "@dfinity/gix-components/styles/mixins/card";
  @use "@dfinity/gix-components/styles/mixins/media";

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

    color: var(--value-color);
  }

  .card-meta {
    @include card.meta;
  }

  .title-placeholder {
    @include text.clamp(6);
    word-break: break-word;
    flex-grow: 1;
  }

  /**
   * TODO: cleanup once legacy removed, status (L2-954) and counter (L2-955)
   */
  .status {
    // Default color: Color.PRIMARY
    --badge-color: var(--primary);
    color: var(--badge-color);

    margin-bottom: 0;

    // Color.WARNING
    &.warning {
      --badge-color: var(--warning-emphasis);
    }

    // Color.SUCCESS
    &.success {
      --badge-color: var(--positive-emphasis);
    }
  }
</style>
