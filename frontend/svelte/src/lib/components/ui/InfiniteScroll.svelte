<script lang="ts">
  import { afterUpdate, createEventDispatcher, onDestroy } from "svelte";

  /**
   * The Infinite Scroll component calls an action to be performed when the user scrolls a specified distance from the bottom or top of the page.
   *
   * Usage: To be wrapped around loops `<InfiniteScroll>{#each ...}</InfiniteScroll>`
   *
   * The component observe the last HTML element of the list using the IntersectionObserver.
   * It sets the reference after each re-render of the list. Pay attention to not trigger unnecessary updates.
   */

  export let options: IntersectionObserverInit = {
    rootMargin: "300px",
    threshold: 0,
  };

  let container: HTMLDivElement;

  const dispatch = createEventDispatcher();

  const onIntersection = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => {
    const intersecting: IntersectionObserverEntry | undefined = entries.find(
      ({ isIntersecting }: IntersectionObserverEntry) => isIntersecting
    );

    if (intersecting === undefined) {
      return;
    }

    // We can disconnect the observer. We have detected an intersection and consumer is going to fetch new elements.
    observer.disconnect();

    dispatch("nnsIntersect");
  };

  let observer: IntersectionObserver = new IntersectionObserver(
    onIntersection,
    options
  );

  afterUpdate(() => {
    // The DOM has been updated. We reset the observer to the current last HTML element of the infinite list.

    // We disconnect previous observer first. We do want to observe multiple elements.
    observer.disconnect();

    if (!container.lastElementChild) {
      return;
    }

    observer.observe(container.lastElementChild);
  });

  onDestroy(() => observer.disconnect());
</script>

<div bind:this={container}>
  <slot />
</div>
