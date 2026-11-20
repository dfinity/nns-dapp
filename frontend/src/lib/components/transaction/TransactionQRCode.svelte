<script lang="ts">
  import { ENABLE_QR_CODE_READER } from "$lib/constants/mockable.constants";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { QRCodeReaderModal } from "$lib/gix";
  import { createEventDispatcher } from "svelte";

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

{#if ENABLE_QR_CODE_READER}
  <QRCodeReaderModal on:nnsQRCode on:nnsQRCodeError={onError} />
{/if}

<div class="toolbar">
  <button
    class="secondary"
    data-tid="transaction-qrcode-button-cancel"
    type="button"
    on:click={cancel}>{$i18n.core.cancel}</button
  >
</div>
