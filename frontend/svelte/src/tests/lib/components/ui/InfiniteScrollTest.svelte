<script lang="ts">
    import InfiniteScroll from "../../../../lib/components/ui/InfiniteScroll.svelte";

    export let elements: number[];
    export let spy: () => void;

    const intersect = () => spy();
</script>

<InfiniteScroll on:nnsIntersect={intersect}>
    {#each elements as element, i}
        <div>Test {i}</div>
    {/each}
</InfiniteScroll>
