<script lang="ts">
  import InfiniteScroll from "../../../../lib/components/ui/InfiniteScroll.svelte";
  import { DEFAULT_LIST_PAGINATION_LIMIT } from "../../../../lib/constants/constants";

  export let elements: number[];
  export let pageLimit: number = DEFAULT_LIST_PAGINATION_LIMIT;
  export let spy: () => void;
</script>

<InfiniteScroll on:nnsIntersect={spy} {pageLimit}>
  {#each elements as element, i}
    <div>Test {i}</div>
  {/each}
</InfiniteScroll>
