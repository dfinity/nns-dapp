<script lang="ts">
  import Countdown from "$lib/components/proposals/Countdown.svelte";
  import ProposalStatusTag from "$lib/components/ui/ProposalStatusTag.svelte";
  import { PROPOSER_ID_DISPLAY_SPLIT_LENGTH } from "$lib/constants/proposals.constants";
  import { i18n } from "$lib/stores/i18n";
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import { nowInSeconds } from "$lib/utils/date.utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import {
    Card,
    IconChat,
    IconClockNoFill,
    IconUser,
    Value,
  } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let hidden = false;
  export let actionable = false;
  export let status: UniversalProposalStatus | undefined;
  export let id: bigint | undefined;
  export let heading: string;
  export let title: string | undefined;
  export let topic: string | undefined = undefined;
  export let proposer: string | undefined;
  export let deadlineTimestampSeconds: bigint | undefined;
  export let href: string;
</script>

<li class:hidden>
  <Card testId="proposal-card" {href}>
    <div class="container">
      <div>
        <div class="header">
          <div class="id" data-proposal-id={id}>
            <Value
              ariaLabel={$i18n.proposal_detail.id_prefix}
              testId="proposal-id">{$i18n.proposal_detail.id}: {id}</Value
            >
          </div>

          {#if nonNullish(status)}
            <ProposalStatusTag {status} {actionable} />
          {/if}
        </div>

        <h3 data-tid="proposal-card-heading">{heading}</h3>

        {#if title}
          <blockquote class="title-placeholder">
            <p class="description">{title}</p>
          </blockquote>
        {/if}
      </div>

      <div>
        {#if nonNullish(topic)}
          <p class="info">
            <IconChat />
            <span class="visually-hidden"
              >{$i18n.proposal_detail.topic_prefix}</span
            ><output data-tid="proposal-topic">{topic}</output>
          </p>
        {/if}

        {#if nonNullish(proposer)}
          <p class="info">
            <IconUser />
            <span class="visually-hidden"
              >{$i18n.proposal_detail.proposer_prefix}</span
            ><output data-proposer-id={proposer}
              >{shortenWithMiddleEllipsis(
                proposer,
                PROPOSER_ID_DISPLAY_SPLIT_LENGTH
              )}</output
            >
          </p>
        {/if}

        {#if nonNullish(deadlineTimestampSeconds) && deadlineTimestampSeconds > nowInSeconds()}
          <p class="info">
            <IconClockNoFill />
            <span class="visually-hidden"
              >{$i18n.proposal_detail.proposer_prefix}</span
            ><output><Countdown {deadlineTimestampSeconds} /></output>
          </p>
        {/if}
      </div>
    </div>
  </Card>
</li>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  li {
    list-style: none;
  }

  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding);
  }

  .id {
    @include text.truncate;
  }

  h3 {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
    margin-bottom: var(--padding-2x);
  }

  p {
    margin: 0;
  }

  blockquote {
    padding: 0 0 var(--padding-3x);

    p {
      @include text.clamp(6);
      word-break: break-word;
    }
  }

  .info {
    display: flex;
    align-items: center;
    gap: var(--padding);
    padding: 0 0 var(--padding-1_5x);

    :global(svg) {
      min-width: 20px;
    }

    span,
    output {
      @include text.clamp(1);
    }
  }
</style>
