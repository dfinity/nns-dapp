<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { HotkeysTableRowData } from "$lib/types/hotkeys";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  type Props = {
    rowData: HotkeysTableRowData;
  };

  const { rowData }: Props = $props();
</script>

<div data-tid="hotkey-actions-cell" class="actions">
  <button
    class="ghost"
    data-tid="replace-hotkey-button"
    disabled={rowData.rowContext.actionsDisabled}
    aria-label={replacePlaceholders($i18n.hotkeys.replace_aria_label, {
      $principal: rowData.hotkey.principal,
    })}
    onclick={() => rowData.rowContext.onReplace(rowData.hotkey)}
    >{$i18n.hotkeys.replace}</button
  >
  <button
    class="ghost remove"
    data-tid="remove-hotkey-button"
    disabled={rowData.rowContext.actionsDisabled}
    aria-label={replacePlaceholders($i18n.hotkeys.remove_aria_label, {
      $principal: rowData.hotkey.principal,
    })}
    onclick={() => rowData.rowContext.onRemove(rowData.hotkey)}
    >{$i18n.hotkeys.remove}</button
  >
</div>

<style lang="scss">
  .actions {
    display: flex;
    gap: var(--padding);
    justify-content: flex-end;
  }

  button {
    color: var(--primary);
  }

  .remove {
    color: var(--negative-emphasis);
  }
</style>
