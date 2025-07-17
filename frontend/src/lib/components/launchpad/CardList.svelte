<script lang="ts">
  import type { ComponentWithProps } from "$lib/types/svelte";

  type Props = {
    cards: ComponentWithProps[];
    testId?: string;
    mobileHorizontalScroll?: boolean;
  };
  const { cards, testId, mobileHorizontalScroll = false }: Props = $props();
</script>

<ul data-tid={testId ?? "card-list-component"} class:mobileHorizontalScroll>
  {#each cards as { Component, props }}
    <li data-tid="card-entry">
      <Component {...props} />
    </li>
  {/each}
</ul>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  ul {
    // reset default list styles
    list-style: none;
    margin: 0;
    padding: 0;

    display: grid;
    grid-template-columns: 1fr;
    gap: var(--padding);

    &.mobileHorizontalScroll {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: var(--padding);

      // Expand visible area to the full width
      padding: 0 var(--padding);
      margin: 0 calc(-1 * var(--padding));
      width: auto;

      li {
        flex: 0 0 90%;
        scroll-snap-align: center;

        &:first-child {
          scroll-snap-align: start;
          padding-left: var(--padding);
        }
        &:last-child {
          scroll-snap-align: end;
          padding-right: var(--padding);
        }
      }
    }
  }

  ul,
  // Explicitly set to override mobile styles of `mobileHorizontalScroll`.
  ul.mobileHorizontalScroll {
    @include media.min-width(medium) {
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--padding-2x);

      li {
        flex: unset;
        scroll-snap-type: none;
        scroll-snap-align: none;
      }
      li:first-child,
      li:last-child {
        padding: 0;
      }
    }

    @include media.min-width(xlarge) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
