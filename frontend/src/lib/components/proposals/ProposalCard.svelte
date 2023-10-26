<script lang="ts">
  import { Card, KeyValuePair, Tag, Value } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { ProposalStatusColor } from "$lib/constants/proposals.constants";
  import Countdown from "./Countdown.svelte";
  import { secondsToDateTime } from "$lib/utils/date.utils";

  export let hidden = false;
  export let statusString: string | undefined;
  export let id: bigint | undefined;
  export let heading: string;
  export let title: string | undefined;
  export let color: ProposalStatusColor | undefined;
  export let deadlineTimestampSeconds: bigint | undefined;
  export let createdTimestampSeconds: bigint;
  export let href: string;
</script>

<li class:hidden>
  <Card testId="proposal-card" {href}>
    <div class="stretch-wrapper">
      <div>
        <h3>{heading}</h3>

        {#if title}
          <div class="highlight">
            <p>{title}</p>
          </div>
        {/if}

        <div class="content">
          <KeyValuePair>
            <span class="description" slot="key"
              >{$i18n.proposal_detail.created_prefix}</span
            >
            <span slot="value"
              >{secondsToDateTime(createdTimestampSeconds)}</span
            >
          </KeyValuePair>

          <KeyValuePair>
            <span class="description" slot="key"
              >{$i18n.proposal_detail.rewards_prefix}</span
            >
            <Countdown slot="value" {deadlineTimestampSeconds} />
          </KeyValuePair>

          <KeyValuePair>
            <span class="description" slot="key"
              >{$i18n.proposal_detail.status_prefix}</span
            >
            <Tag slot="value" intent={color}>{statusString}</Tag>
          </KeyValuePair>
        </div>
      </div>

      <div>
        <p class="id">{id}</p>
      </div>
    </div>
  </Card>
</li>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  li.hidden {
    visibility: hidden;
  }

  .stretch-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: var(--padding-3x);
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

  .highlight {
    padding: var(--padding);
    border-radius: var(--border-radius-0_5x);

    margin-bottom: var(--padding-2x);

    box-sizing: border-box;
    width: 100%;

    & p {
      width: 100%;

      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      overflow: hidden;

      word-break: break-all;
    }
    // TODO: Create and use a variable in gix-components
    background: var(--purple-600);
    color: var(--purple-50);
  }

  @include media.dark-theme {
    .highlight {
      background: var(--purple-50);
      color: var(--purple-dark-900);
    }
  }

  .id {
    color: var(--primary);
    text-align: right;
  }
</style>
