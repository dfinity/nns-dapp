<script lang="ts">
  import { QRCodeReaderModal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { toastsError } from "$lib/stores/toasts.store";

  const dispatcher = createEventDispatcher();
  const cancel = () => dispatcher("nnsCancel");

  const onError = ({ detail: err }: CustomEvent<Error>) => {
    toastsError({
      labelKey: "error.qrcode_camera_error",
      err,
    });

    cancel();
  };
</script>

<QRCodeReaderModal on:nnsQRCode on:nnsQRCodeError={onError} />

<div class="toolbar">
  <button
    class="secondary"
    data-tid="transaction-button-cancel"
    type="button"
    on:click={cancel}>{$i18n.core.cancel}</button
  >
</div>
