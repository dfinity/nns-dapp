<script lang="ts">
  import Toolbar from "$lib/gix/components/Toolbar.svelte";
</script>

<Toolbar>
  {#snippet start()}
    <div data-tid="toolbar-test-start-slot"></div>
  {/snippet}
  <div data-tid="toolbar-test-slot"></div>
  {#snippet end()}
    <div data-tid="toolbar-test-end-slot"></div>
  {/snippet}
</Toolbar>
