<script lang="ts">
  import InfiniteScroll from "$lib/gix/components/InfiniteScroll.svelte";

  export let elements: number[];
  export let disabled = false;
  export let spy: () => Promise<void>;
</script>

<InfiniteScroll {disabled} onIntersect={spy}>
  {#each elements as _element, i (i)}
    <div>Test {i}</div>
  {/each}
</InfiniteScroll>
