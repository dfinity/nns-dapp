<script lang="ts">
  import type { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { isDesktop } from "$lib/gix/utils/device.utils";
  import { nextElementId } from "$lib/gix/utils/html.utils";

  const id = nextElementId("qrcode-reader-");

  const dispatch = createEventDispatcher();

  let html5QrCode: Html5Qrcode | undefined;

  let ScannerState: typeof Html5QrcodeScannerState;
  let isDestroyed = false;

  onMount(async () => {
    const qrCodeSuccessCallback = (decodedText: string) =>
      dispatch("nnsQRCode", decodedText);

    // Source documentation: https://scanapp.org/blog/2022/01/09/setting-dynamic-qr-box-size-in-html5-qrcode.html
    const qrboxFunction = (
      viewfinderWidth: number,
      viewfinderHeight: number
    ) => {
      const minEdgePercentage = 0.7; // 70%
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
      return {
        width: qrboxSize,
        height: qrboxSize,
      };
    };

    const { Html5Qrcode, Html5QrcodeScannerState } = await import(
      "html5-qrcode"
    );
    ScannerState = Html5QrcodeScannerState;

    html5QrCode = new Html5Qrcode(id);

    await html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10, // Optional, frame per seconds for qr code scanning
          qrbox: qrboxFunction,
        },
        qrCodeSuccessCallback,

        (_errorMessage: string) => {
          // Do nothing. This error message is throw when the QR code cannot be read.
          // Examples of error:
          // QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.
          // QR code parse error, error = No barcode or QR code detected.
          // QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.
        }
      )
      .catch((err: unknown) => {
        dispatch("nnsQRCodeError", err);
      });
    if (isDestroyed) {
      // Make sure the camera is stopped if the component is destroyed before
      // scanning is starte.
      await html5QrCode?.stop();
    }
  });

  onDestroy(async () => {
    isDestroyed = true;
    try {
      if (html5QrCode?.getState() !== ScannerState?.NOT_STARTED) {
        await html5QrCode?.stop();
      }
    } catch (err: unknown) {
      console.error(err);
      dispatch(
        "nnsQRCodeError",
        new Error("There was an error while destroying the QR code reader.")
      );
    }
  });

  // We optimistically assume that if the QR code reader is used on desktop, it has most probably only a single "user" facing camera and that we can invert the displayed video
  const mirror = isDesktop();
</script>

<article {id} class="reader" class:mirror></article>

<style lang="scss">
  .reader {
    position: relative;
    width: 100%;
    height: auto;

    border-radius: var(--border-radius);
    overflow: hidden;

    &.mirror {
      transform: scaleX(-1);
    }

    :global(#qr-shaded-region) {
      border-color: rgba(var(--primary-rgb), 0.4) !important;
    }

    :global(#qr-shaded-region > div) {
      background: white !important;
    }
  }
</style>
