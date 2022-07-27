<script lang="ts">
  import MenuItem from "../../../../lib/components/ui/MenuItem.svelte";
</script>

<MenuItem href="https://test">
  <div data-tid="menuitem-test-icon" slot="icon" />
  <div data-tid="menuitem-test-default" />
  <div data-tid="menuitem-test-status-icon" slot="statusIcon" />
</MenuItem>
