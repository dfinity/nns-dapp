<script lang="ts">
  import type { HotkeysTableRowData } from "$lib/types/hotkeys";

  type Props = {
    rowData: HotkeysTableRowData;
  };

  const { rowData }: Props = $props();
</script>

<span data-tid="hotkey-neurons-cell">{rowData.hotkey.neuronCount}</span>
