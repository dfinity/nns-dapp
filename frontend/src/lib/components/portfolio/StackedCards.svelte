<script lang="ts">
  import type { ComponentType, SvelteComponent } from "svelte";
  import { onDestroy, onMount } from "svelte";

  type AnyComponent = ComponentType<SvelteComponent>;
  type CardItem = {
    component: AnyComponent;
    props?: Record<string, unknown>;
  };

  export let cards: CardItem[] = [];
  let activeIndex = 0;
  let timer: number;

  const nextCard = () => {
    activeIndex = (activeIndex + 1) % cards.length;
  };

  const setCard = (index: number) => {
    activeIndex = index;
    resetTimer();
  };

  const resetTimer = () => {
    if (timer) clearInterval(timer);

    if (cards.length > 1) {
      timer = window.setInterval(nextCard, 5000);
    }
  };

  onMount(() => {
    resetTimer();
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
</script>

<div class="stacked-cards" data-tid="stacked-cards-component">
  {#if cards.length > 0}
    <div class="cards-wrapper">
      {#each cards as card, i}
        <div
          class="card-wrapper"
          class:active={i === activeIndex}
          data-tid="project-card-wrapper-{i}"
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
            aria-label={`Switch to project ${i + 1}`}
            data-tid="dot-button-{i}"
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
        transition: opacity 0.5s ease-in-out;
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        &.active {
          position: relative;
          opacity: 1;
          pointer-events: all;
          z-index: 1;
        }
      }
    }
    .dots-container {
      display: flex;
      justify-content: center;
      gap: var(--padding);
      padding: var(--padding) 0;
      margin-top: var(--padding);
      position: absolute;
      z-index: 10;
      bottom: 0;
      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid var(--button-secondary-color);
        cursor: pointer;
        padding: 0;
        margin: 0;
        transition: all 0.3s ease;
        &:hover {
          transform: scale(1.2);
        }
        &.active {
          background-color: var(--button-secondary-color);
          border-color: var(--button-secondary-color);
        }
      }
    }
  }
</style>
