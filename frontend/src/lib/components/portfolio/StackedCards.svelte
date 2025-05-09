<script lang="ts" module>
  import type { Component } from "svelte";
  import { onDestroy } from "svelte";

  export type CardItem = {
    component: Component;
    props?: Record<string, unknown>;
  };

  const REFRESH_INTERVAL = 2000;
  const SWIPE_THRESHOLD = 50;
</script>

<script lang="ts">
  type Props = { cards: CardItem[] };
  const { cards = [] }: Props = $props();

  let activeIndex = $state(0);

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
          class:pulse={i === activeIndex}
          data-tid="project-card-wrapper"
        >
          <card.component {...card.props} />
        </div>
      {/each}
    </div>

    {#if cards.length > 1}
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
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  :root {
    --card-stacked-dots-space: 34px;
  }

  @keyframes pulse-animation {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(61, 77, 153, 0.2);
    }
    50% {
      transform: scale(1.03);
      box-shadow: 0 0 0 5px rgba(61, 77, 153, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(61, 77, 153, 0);
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
        transition: opacity var(--animation-time-long) ease-in-out;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;

        &.active {
          position: relative;
          opacity: 1;
          pointer-events: all;
        }
        &.pulse {
          animation: pulse-animation 400ms ease-out;
        }
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
