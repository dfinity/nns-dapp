<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import type { HotkeysTableRowData } from "$lib/types/hotkeys";

  type Props = {
    rowData: HotkeysTableRowData;
  };

  const { rowData }: Props = $props();
</script>

<div data-tid="hotkey-cell">
  <Hash
    text={rowData.hotkey.principal}
    tagName="span"
    idPrefix="hotkey-cell"
    showCopy
  />
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
  }
</style>
