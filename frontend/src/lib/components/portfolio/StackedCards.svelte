<script lang="ts" module>
  import { IconLeft, IconRight } from "@dfinity/gix-components";
  import type { Component } from "svelte";
  import { onDestroy } from "svelte";

  export type CardItem = {
    component: Component;
    props?: Record<string, unknown>;
  };

  const REFRESH_INTERVAL = 5000;
  const SWIPE_THRESHOLD = 50;
  const MAX_NUMBER_OF_DOTS = 7;
</script>

<script lang="ts">
  type Props = { cards: CardItem[] };
  const { cards = [] }: Props = $props();

  let activeIndex = $state(0);
  let previousIndex = $state<number | null>(null);

  let intervalId: number | undefined;
  let touchStartX: number = 0;
  let touchEndX: number = 0;

  const prevCard = () => {
    const newIndex = (activeIndex - 1 + cards.length) % cards.length;
    setCard(newIndex);
  };

  const nextCard = () => {
    const newIndex = (activeIndex + 1) % cards.length;
    setCard(newIndex);
  };

  const setCard = (newIndex: number) => {
    if (newIndex === activeIndex) return;

    previousIndex = activeIndex;
    activeIndex = newIndex;
    resetTimer();
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX = event.touches[0].clientX;
    clearInterval();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = SWIPE_THRESHOLD;
    if (Math.abs(swipeDistance) < minSwipeDistance) return;
    if (swipeDistance > 0) prevCard();
    else nextCard();
  };

  const clearInterval = () => {
    if (intervalId) window.clearInterval(intervalId);
  };

  const resetTimer = () => {
    clearInterval();

    if (cards.length > 1) {
      intervalId = window.setInterval(nextCard, REFRESH_INTERVAL);
    }
  };

  onDestroy(clearInterval);
  resetTimer();
</script>

<div
  class="stacked-cards"
  data-tid="stacked-cards-component"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
>
  {#if cards.length > 0}
    <div class="cards-wrapper">
      {#each cards as card, i}
        <div
          class="card-wrapper"
          class:active={i === activeIndex}
          class:exiting={i === previousIndex}
          data-tid="project-card-wrapper"
        >
          <card.component {...card.props} />
        </div>
      {/each}
    </div>

    {#if cards.length > MAX_NUMBER_OF_DOTS}
      <div class="buttons-container" data-tid="buttons-container">
        <button
          class="ghost"
          onclick={prevCard}
          aria-label="Previuos Card"
          data-tid="prev-button"><IconLeft size="24px" /></button
        >
        <span class="current-card-index" data-tid="activeIndex"
          >{activeIndex + 1}</span
        >
        <button
          class="ghost"
          onclick={nextCard}
          aria-label="Next Card"
          data-tid="next-button"><IconRight size="24px" /></button
        >
      </div>
    {:else if cards.length > 1}
      <div class="dots-container" data-tid="dots-container">
        {#each cards as _, i}
          <button
            class="dot"
            class:active={i === activeIndex}
            onclick={() => setCard(i)}
            disabled={i === activeIndex}
            aria-label={`Display ${i + 1} card`}
            data-tid="dot-button"
          ></button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  :root {
    --card-stacked-dots-space: 34px;
    --elastic-out: cubic-bezier(0.16, 1.1, 0.3, 1.2);
  }

  @keyframes pulse {
    0% {
      transform: scale(0.97);
      opacity: 0.8;
    }
    40% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  .stacked-cards {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    position: relative;
    touch-action: pan-y;

    .cards-wrapper {
      position: relative;
      width: 100%;

      .card-wrapper {
        opacity: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        transition: opacity 250ms ease-out;

        &.active {
          position: relative;
          opacity: 1;
          pointer-events: all;
          animation: pulse 550ms var(--elastic-out) forwards;
        }

        &.exiting {
          animation: fade-out 250ms ease-out forwards;
        }
      }
    }

    .buttons-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--padding-1_5x);
      position: absolute;
      bottom: var(--padding-0_5x);

      button {
        color: var(--button-secondary-color);
        padding: 0;
        display: flex;
        align-items: center;
      }

      .current-card-index {
        color: var(--text-description);
        font-weight: var(--font-weight-bold);
      }
    }

    .dots-container {
      display: flex;
      justify-content: center;
      gap: var(--padding-2x);
      position: absolute;
      bottom: var(--padding-1_5x);

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        // TODO(yhabib): Reconciliate colors with GIX
        background-color: rgba(#3d4d99, 0.35);
        padding: 0;
        margin: 0;
        transition: all var(--animation-time-normal) ease;

        &:hover {
          transform: scale(1.2);
        }
        &.active {
          background-color: rgba(#3d4d99, 0.75);
        }
      }
    }
  }
</style>
