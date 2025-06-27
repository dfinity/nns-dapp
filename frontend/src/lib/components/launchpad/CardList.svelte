<script lang="ts">
  import type { ComponentWithProps } from "$lib/types/svelte";

  type Props = {
    cards: ComponentWithProps[];
  };
  const { cards }: Props = $props();
</script>

<ul data-tid="card-section-component">
  {#each cards as { Component, props }}
    <li data-tid="card-entry">
      <Component {...props} />
    </li>
  {/each}
</ul>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

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
