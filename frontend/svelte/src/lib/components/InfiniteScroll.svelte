<script lang="ts">
  import {afterUpdate, createEventDispatcher, onDestroy} from 'svelte';

  export let options: IntersectionObserverInit = {
    rootMargin: "300px",
    threshold: 0,
  };

  let container!: HTMLDivElement;

  const dispatch = createEventDispatcher();

  const onIntersection = (entries: IntersectionObserverEntry[]) => {
    const intersecting: IntersectionObserverEntry | undefined = entries.find(
      ({ isIntersecting }: IntersectionObserverEntry) => isIntersecting
    );

    if (intersecting === undefined) {
      return;
    }

    dispatch("nnsIntersect");
  };

  let observer: IntersectionObserver = new IntersectionObserver(
    onIntersection,
    options
  );

  afterUpdate(() => {
    // The DOM has been updated. We reset the observer to the current last HTML element of the infinite list.
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
