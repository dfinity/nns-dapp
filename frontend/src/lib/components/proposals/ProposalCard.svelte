<script lang="ts">
  import {
    Card,
    IconChat,
    IconClockNoFill,
    IconUser,
    Value,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import Countdown from "./Countdown.svelte";
  import { nowInSeconds } from "$lib/utils/date.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { PROPOSER_ID_DISPLAY_SPLIT_LENGTH } from "$lib/constants/proposals.constants";
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import ProposalStatusTag from "$lib/components/ui/ProposalStatusTag.svelte";
  import { fly, type FlyParams } from "svelte/transition";
  import {
    PROPOSAL_CARD_ANIMATION_DELAY_IN_MILLISECOND,
    PROPOSAL_CARD_ANIMATION_DURATION_IN_MILLISECOND,
    PROPOSAL_CARD_ANIMATION_EASING,
    PROPOSAL_CARD_ANIMATION_Y,
  } from "$lib/constants/constants";
  import { isNode } from "$lib/utils/dev.utils";
  import { isHtmlElementInViewport } from "$lib/utils/utils";

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
  export let index = 0;
  export let noAnimation = false;

  let element: HTMLElement;

  let inViewport: boolean = false;
  $: inViewport =
    isNode() || isNullish(element) ? true : isHtmlElementInViewport(element);

  // A short delay to wait when the cards are being rendered.
  // This process takes some time on FF and Safari, which makes the animation look not perfect.
  const CARD_ANIMATION_DELAY = 250;
  // Apply sequential fly animation to only first cards:
  // 1. to not waist resources on not visible animation;
  // 2. to make the proposal lazy loading still looks good.
  const TOP_MAX_ANIMATED_CARDS = 18;
  let topCards = false;
  $: topCards = index < TOP_MAX_ANIMATED_CARDS;
  let flyAnimation: FlyParams = {};
  $: flyAnimation = {
    duration: noAnimation
      ? 0
      : topCards
      ? PROPOSAL_CARD_ANIMATION_DURATION_IN_MILLISECOND
      : 0,
    delay: topCards
      ? index * PROPOSAL_CARD_ANIMATION_DELAY_IN_MILLISECOND +
        CARD_ANIMATION_DELAY
      : // Adjust the animation start time for cards other than the first ones,
        // so they appear right after the first cards becomes visible.
        TOP_MAX_ANIMATED_CARDS * PROPOSAL_CARD_ANIMATION_DELAY_IN_MILLISECOND +
        CARD_ANIMATION_DELAY +
        PROPOSAL_CARD_ANIMATION_DURATION_IN_MILLISECOND / 2,
    // Do not apply any animation to the cards that are not in the viewport.
    y: inViewport ? PROPOSAL_CARD_ANIMATION_Y : 0,
    opacity: inViewport ? 0 : 1,
    easing: PROPOSAL_CARD_ANIMATION_EASING,
  };
</script>

<li bind:this={element} class:hidden in:fly|global={flyAnimation}>
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
    will-change: transform, opacity;
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
