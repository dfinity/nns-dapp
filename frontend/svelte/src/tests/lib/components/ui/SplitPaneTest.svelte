<script lang="ts">
  import SplitPane from "../../../../lib/components/ui/SplitPane.svelte";

</script>

<SplitPane >
    <div data-tid="split-pane-test-slot" />
    <div data-tid="split-pane-test-menu-slot" slot="menu" />
    <div data-tid="split-pane-test-header-slot" slot="header" />
</SplitPane>
