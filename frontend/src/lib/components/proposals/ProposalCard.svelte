<script lang="ts">
  import {
    Card,
    IconChat,
    IconClockNoFill,
    IconUser,
    Tag,
    Value,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import Countdown from "./Countdown.svelte";
  import { nowInSeconds } from "$lib/utils/date.utils";
  import { nonNullish } from "@dfinity/utils";

  export let hidden = false;
  export let statusString: string | undefined;
  export let id: bigint | undefined;
  export let heading: string;
  export let title: string | undefined;
  export let color: ProposalStatusColor | undefined;
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
              testId="proposal-id">ID: {id}</Value
            >
          </div>

          <Tag intent={color}>{statusString}</Tag>
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
          <p data-tid="proposal-topic">
            <IconChat />
            <span class="visually-hidden"
              >{$i18n.proposal_detail.topic_prefix}</span
            ><output>{topic}</output>
          </p>
        {/if}

        <p data-proposer-id={proposer}>
          <IconUser />
          <span class="visually-hidden"
            >{$i18n.proposal_detail.proposer_prefix}</span
          ><output>{proposer}</output>
        </p>

        {#if nonNullish(deadlineTimestampSeconds) && deadlineTimestampSeconds > nowInSeconds()}
          <p data-proposer-id={proposer}>
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

  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  h3 {
    margin-bottom: var(--padding-2x);
  }

  p {
    margin: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .header {
    display: flex;
    justify-content: space-between;
  }

  h3 {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }

  blockquote {
    padding: 0 0 var(--padding-2x);
  }

  p {
    display: flex;
    align-items: center;
    gap: var(--padding);
    padding: 0 0 var(--padding-1_5x);

    :global(svg) {
      min-width: 20px;
    }

    span,
    output {
      @include text.truncate;
    }
  }
</style>
