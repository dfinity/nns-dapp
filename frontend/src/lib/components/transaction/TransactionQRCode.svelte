<script lang="ts">
  import { QRCodeReaderModal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { ENABLE_QR_CODE_READER } from "$lib/constants/mockable.constants";

  // TODO: can we improve the local development experience if the QR code needs to be used locally?
  /**
   *
   * Important note for local development (only):
   *
   * Because the QR code web worker is bundled in the Gix component, both local development and npm run test won't be able to load the related web worker.
   * If you are looking to develop a feature that requires the QR code reader locally, install the gix-components locally:
   *
   * npm rm @dfinity/gix-components && npm i /path/to/gix-cmp
   *
   */

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
