<script lang="ts" context="module">
  import type { ComponentType, SvelteComponent } from "svelte";
  type AnyComponent = ComponentType<SvelteComponent>;

  export type CardItem = {
    component: AnyComponent;
    props?: Record<string, unknown>;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  export let cards: CardItem[] = [];
  let activeIndex = 0;
  let intervalId: number;

  const nextCard = () => {
    activeIndex = (activeIndex + 1) % cards.length;
  };

  const setCard = (index: number) => {
    activeIndex = index;
    resetTimer();
  };

  const resetTimer = () => {
    if (intervalId) clearInterval(intervalId);

    if (cards.length > 1) {
      intervalId = window.setInterval(nextCard, 5000);
    }
  };

  onMount(() => {
    resetTimer();
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<div class="stacked-cards" data-tid="stacked-cards-component">
  {#if cards.length > 0}
    <div class="cards-wrapper">
      {#each cards as card, i}
        <div
          class="card-wrapper"
          class:active={i === activeIndex}
          data-tid="project-card-wrapper"
        >
          <svelte:component this={card.component} {...card.props} />
        </div>
      {/each}
    </div>

    {#if cards.length > 1}
      <div class="dots-container" data-tid="dots-container">
        {#each cards as _, i}
          <button
            class="dot"
            class:active={i === activeIndex}
            on:click={() => setCard(i)}
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

  .stacked-cards {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    position: relative;

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
      }
    }

    .dots-container {
      display: flex;
      justify-content: center;
      gap: var(--padding-1_5x);
      position: absolute;
      bottom: var(--padding-1_5x);

      .dot {
        width: var(--padding-1_5x);
        height: var(--padding-1_5x);
        border-radius: 50%;
        // TODO(yhabib): Reconciliate colors with GIX
        background-color: rgba(#3d4d99, 0.35);
        padding: 0;
        margin: 0;
        transition: all 0.3s ease;

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
