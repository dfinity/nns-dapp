<script lang="ts">
  import { QRCodeReaderModal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();
  const onCancel = () => dispatcher("nnsCancel");
</script>

<QRCodeReaderModal on:nnsQRCode />

<div class="toolbar">
  <button
    class="secondary"
    data-tid="transaction-button-cancel"
    type="button"
    on:click={onCancel}>{$i18n.core.cancel}</button
  >
</div>
