<script lang="ts">
  import SplitPane from "$lib/gix/components/SplitPane.svelte";
</script>

<SplitPane>
  <div data-tid="split-pane-test-slot"></div>
  <div slot="menu" data-tid="split-pane-test-menu-slot"></div>
</SplitPane>
