<script lang="ts" module>
  import { onDestroy, type Component } from "svelte";
  import { elasticOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";

  export type CardItem = {
    component: Component;
    props?: Record<string, unknown>;
  };
</script>

<script lang="ts">
  import { IconLeft, IconRight } from "@dfinity/gix-components";

  type Props = { cards: CardItem[] };

  const { cards = [] }: Props = $props();

  const CARD_TRANSITION_DURATION = 5000;

  let activeIndex = $state(0);
  let intervalId: number | undefined;
  let touchStartX = 0;
  let touchEndX = 0;

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

  const resetTimer = () => {
    cleanUpInterval();

    if (cards.length > 1) {
      intervalId = window.setInterval(nextCard, CARD_TRANSITION_DURATION);
    }
  };

  const cleanUpInterval = () => {
    if (intervalId) clearInterval(intervalId);
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX = event.touches[0].clientX;
    cleanUpInterval();
  };

  const handleTouchEnd = (event: TouchEvent) => {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
    resetTimer();
  };

  const handleSwipe = () => {
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    if (swipeDistance > 0) prevCard();
    else nextCard();
  };

  onDestroy(cleanUpInterval);

  resetTimer();

  const card = $derived(cards[activeIndex]);
</script>

<div
  class="stacked-cards"
  data-tid="stacked-cards-component"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
>
  {#if cards.length > 0}
    <div class="cards-wrapper">
      {#key activeIndex}
        <div
          class="card-wrapper"
          data-tid="project-card-wrapper"
          in:scale={{
            start: 0.97,
            opacity: 0.8,
            duration: 550,
            easing: elasticOut,
          }}
          out:fade={{
            duration: 250,
          }}
        >
          <card.component {...card.props || {}} />
        </div>
      {/key}
    </div>
    {#if cards.length > 4}
      <div class="buttons-container">
        <button onclick={prevCard} aria-label={`Prev. Card`}
          ><IconLeft size="24" /></button
        >
        <span class="slider-label">{activeIndex + 1}</span>
        <button onclick={nextCard} aria-label={`Prev. Card`}
          ><IconRight size="24" /></button
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
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  :root {
    --card-stacked-dots-space: 34px;
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
      height: 270px;

      .card-wrapper:not(:only-child) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
      }
    }

    .buttons-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--padding-2x);
      position: absolute;
      bottom: var(--padding-1_5x);
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
