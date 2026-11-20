<script lang="ts">
  import MenuItem from "$lib/gix/components/MenuItem.svelte";
</script>

<MenuItem href="https://test">
  <div slot="icon" data-tid="menuitem-test-icon"></div>
  <div data-tid="menuitem-test-default"></div>
  <div slot="statusIcon" data-tid="menuitem-test-status-icon"></div>
</MenuItem>
