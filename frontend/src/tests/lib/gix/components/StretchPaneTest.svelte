<script lang="ts">
  import StretchPane from "$lib/gix/components/StretchPane.svelte";
</script>

<StretchPane>
  <div data-tid="stretch-pane-test-slot"></div>
  <div slot="menu" data-tid="stretch-pane-test-menu-slot"></div>
</StretchPane>
