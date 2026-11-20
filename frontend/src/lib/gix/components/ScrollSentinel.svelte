<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import { untrack } from "svelte";
  import { layoutContentTopHidden } from "$lib/gix/stores/layout.store";

  // The ScrollSentinel component should be placed right before the content
  // inside the scrollable container.

  interface Props {
    scrollContainer: HTMLElement;
  }

  let { scrollContainer }: Props = $props();

  // To observe when the top leaves the view
  let element = $state<HTMLElement | undefined>();

  const observer = new IntersectionObserver(
    ([entry]) => layoutContentTopHidden.set(!entry.isIntersecting),
    { root: untrack(() => scrollContainer), threshold: 0 }
  );

  // We disconnect previous observer before any update.
  $effect.pre(() => {
    observer.disconnect();
  });

  $effect(() => {
    if (isNullish(element)) {
      return;
    }

    observer.observe(element);

    return () => observer.disconnect();
  });
</script>

<div bind:this={element} class="sentinel" data-tid="sentinel"></div>

<style lang="scss">
  .sentinel {
    width: 0;
    height: 0;
    opacity: 0;
    visibility: hidden;
  }
</style>
