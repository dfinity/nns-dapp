<script lang="ts">
  import { Card, Value } from "@dfinity/gix-components";
  import {
    type ProposalInfo,
    type NeuronId,
    type ProposalId,
    ProposalStatus,
  } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { mapProposalInfo } from "$lib/utils/proposals.utils";
  import ProposalCountdown from "./ProposalCountdown.svelte";
  import { keyOfOptional } from "$lib/utils/utils";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import type {ProposalStatusColor} from "$lib/constants/proposals.constants";

  export let proposalInfo: ProposalInfo;
  export let hidden = false;

  let status: ProposalStatus = ProposalStatus.Unknown;
  let id: ProposalId | undefined;
  let title: string | undefined;
  let color: ProposalStatusColor | undefined;

  let topic: string | undefined;
  let proposer: NeuronId | undefined;
  let type: string | undefined;

  $: ({ status, id, title, color, topic, proposer, type } =
    mapProposalInfo(proposalInfo));

  const showProposal = async () =>
    await goto(
      buildProposalUrl({
        universe: $pageStore.universe,
        proposalId: `${id}`,
      })
    );
</script>

<li class:hidden>
  <Card
    role="link"
    on:click={showProposal}
    testId="proposal-card"
    withArrow={true}
  >
    <div class="card-meta id" data-proposal-id={id}>
      <Value ariaLabel={$i18n.proposal_detail.id_prefix}>{id}</Value>
    </div>

    <div class="card-meta">
      <span>{$i18n.proposal_detail.type_prefix}</span>
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

    <blockquote class="title-placeholder">
      <p class="description">{title}</p>
    </blockquote>

    <div class="card-meta">
      <p class={`${color ?? ""} status`}>
        {keyOfOptional({ obj: $i18n.status, key: ProposalStatus[status] }) ??
          ""}
      </p>

      <ProposalCountdown {proposalInfo} />
    </div>
  </Card>
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

    &.id {
      justify-content: flex-end;

      :global(.value) {
        color: var(--primary);
      }
    }
  }

  .title-placeholder {
    flex-grow: 1;

    p {
      @include text.clamp(6);
      word-break: break-word;
    }
  }

  /**
   * TODO: cleanup once legacy removed, status (L2-954) and counter (L2-955)
   */
  .status {
    // Default color: ProposalStatusColor.PRIMARY
    --badge-color: var(--primary);
    color: var(--badge-color);

    margin-bottom: 0;

    // ProposalStatusColor.WARNING
    &.warning {
      --badge-color: var(--warning-emphasis);
    }

    // ProposalStatusColor.SUCCESS
    &.success {
      --badge-color: var(--positive-emphasis);
    }

    // ProposalStatusColor.ERROR
    &.error {
      --badge-color: var(--negative-emphasis-light);
    }
  }
</style>
