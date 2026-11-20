<svelte:options accessors />

<script lang="ts">
  import SplitContent from "$lib/gix/components/SplitContent.svelte";

  export let originalComponent: SplitContent;
</script>

<SplitContent bind:this={originalComponent}>
  {#snippet start()}<div data-tid="content-test-start-slot"></div>{/snippet}
  {#snippet end()}<div data-tid="content-test-end-slot"></div>{/snippet}
  {#snippet title()}<div data-tid="content-test-title-slot"></div>{/snippet}
  {#snippet toolbarEnd()}<div data-tid="content-test-toolbar-end-slot"
    ></div>{/snippet}
</SplitContent>
