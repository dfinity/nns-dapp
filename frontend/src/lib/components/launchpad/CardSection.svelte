<script lang="ts">
  import type { ComponentWithProps } from "$lib/types/svelte";

  type Props = {
    title: string;
    cards: ComponentWithProps[];
  };
  const { title, cards }: Props = $props();
</script>

<div class="card-section" data-tid="card-section-component">
  <h4 data-tid="title">{title}</h4>
  <ul class="cards">
    {#each cards as { Component, props }}
      <li data-tid="card-entry">
        <Component {...props} />
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  h4 {
    // TODO(launchpad): variables?
    font-size: 16px;
    font-weight: 450;
    line-height: 20px;
  }

  .card-section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  ul {
    // reset default styles
    list-style: none;
    margin: 0;
    padding: 0;

    display: grid;
    grid-template-columns: 1fr;
    gap: var(--padding);

    @include media.min-width(medium) {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--padding-2x);
    }

    @include media.min-width(large) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
