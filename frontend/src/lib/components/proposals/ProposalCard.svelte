<script lang="ts">
  import { Card, KeyValuePair, Value } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import Countdown from "./Countdown.svelte";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";

  export let hidden = false;
  export let statusString: string | undefined;
  export let id: bigint | undefined;
  export let title: string | undefined;
  export let color: ProposalStatusColor | undefined;
  export let topic: string | undefined = undefined;
  export let proposer: string | undefined;
  export let type: string | undefined;
  export let deadlineTimestampSeconds: bigint | undefined;
</script>

<li class:hidden>
  <Card role="link" on:click testId="proposal-card" icon="arrow">
    <div class="id" data-proposal-id={id}>
      <Value ariaLabel={$i18n.proposal_detail.id_prefix}>{id}</Value>
    </div>

    <div class="meta-data">
      {#if type !== undefined}
        <KeyValuePair testId="proposal-type">
          <span slot="key">{$i18n.proposal_detail.type_prefix}</span>
          <span
            slot="value"
            class="meta-data-value"
            aria-label={$i18n.proposal_detail.type_prefix}>{type}</span
          >
        </KeyValuePair>
      {/if}

      {#if topic !== undefined}
        <KeyValuePair>
          <span slot="key">{$i18n.proposal_detail.topic_prefix}</span>
          <span slot="value" class="meta-data-value">{topic ?? ""}</span>
        </KeyValuePair>
      {/if}

      {#if proposer !== undefined}
        <KeyValuePair>
          <span slot="key">{$i18n.proposal_detail.proposer_prefix}</span>
          <span slot="value" class="meta-data-value"
            >{shortenWithMiddleEllipsis(proposer, 5)}</span
          >
        </KeyValuePair>
      {/if}
    </div>

    <blockquote class="title-placeholder">
      <p class="description">{title}</p>
    </blockquote>

    <KeyValuePair>
      <p slot="key" class={`${color ?? ""} status`}>
        {statusString}
      </p>
      <Countdown slot="value" {deadlineTimestampSeconds} />
    </KeyValuePair>
  </Card>
</li>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  li.hidden {
    visibility: hidden;
  }

  .id {
    display: flex;
    justify-content: flex-end;

    margin-bottom: var(--padding);

    :global(.value) {
      color: var(--tertiary);
    }
  }

  .meta-data {
    margin-bottom: var(--padding);

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    // Prevent texts that need two lines leave space on the right side
    & .meta-data-value {
      text-align: right;
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
