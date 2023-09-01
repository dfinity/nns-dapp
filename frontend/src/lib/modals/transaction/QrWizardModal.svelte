<script lang="ts">
  import type { QrResponse, QrResult } from "$lib/types/qr-wizard-modal";
  import TransactionQRCode from "$lib/components/transaction/TransactionQRCode.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { decodePayment } from "@dfinity/ledger";
  import type { Token } from "@dfinity/utils";
  import { isNullish, nonNullish, assertNonNullish } from "@dfinity/utils";

  export let testId: string | undefined = undefined;
  export let steps: WizardSteps;
  export let currentStep: WizardStep | undefined = undefined;
  export let disablePointerEvents = false;

  const STEP_QRCODE = "QRCode";

  let stepsPlusQr: WizardSteps;
  $: stepsPlusQr = [
    ...steps,
    {
      name: STEP_QRCODE,
      title: "",
    },
  ];

  export let modal: WizardModal;

  export const set = (step: number) => {
    modal.set(step);
  };

  const goStep = (stepName: string) => {
    const stepNumber = stepsPlusQr.findIndex(({ name }) => name === stepName);
    set(stepNumber);
  };

  let resolveQrCodePromise:
    | (({ result, value }: { result: QrResult; value?: string }) => void)
    | undefined = undefined;

  const decodeQrCode = ({
    result,
    value,
    requiredToken,
  }: {
    result: QrResult;
    value?: string | undefined;
    requiredToken?: Token | undefined;
  }): QrResponse => {
    if (result !== "success") {
      return { result };
    }
    // Because `result === "success"`, value is defined.
    // This is just here to convince TypeScript.
    assertNonNullish(value);

    const payment = decodePayment(value);

    if (isNullish(payment)) {
      return { result, identifier: value };
    }

    const { token, identifier, amount } = payment;

    if (
      nonNullish(requiredToken) &&
      token.toLowerCase() !== requiredToken.symbol.toLowerCase()
    ) {
      toastsError({
        labelKey: "error.qrcode_token_incompatible",
      });
      return { result: "token_incompatible" };
    }

    return { result, identifier, token, amount };
  };

  export const scanQrCode = async ({
    requiredToken,
  }: {
    requiredToken: Token;
  }): Promise<QrResponse> => {
    const prevStep = currentStep;

    goStep(STEP_QRCODE);

    return new Promise<{ result: QrResult; value?: string }>((resolve) => {
      resolveQrCodePromise = resolve;
    })
      .then(({ result, value }) => {
        return decodeQrCode({
          result,
          value,
          requiredToken,
        });
      })
      .finally(() => {
        // TypeScript can't know that currentStep is defined before scanQrCode
        // will be called.
        goStep(prevStep?.name || steps[0].name);
      });
  };

  const onQRCode = ({ detail: value }: CustomEvent<string>) => {
    resolveQrCodePromise?.({
      result: "success",
      value,
    });
    resolveQrCodePromise = undefined;
  };

  const onCancel = () => {
    resolveQrCodePromise?.({
      result: "canceled",
    });
    resolveQrCodePromise = undefined;
  };
</script>

<WizardModal
  {testId}
  steps={stepsPlusQr}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
  {disablePointerEvents}
>
  <slot name="title" slot="title" />
  <slot />
  {#if currentStep?.name === STEP_QRCODE}
    <TransactionQRCode on:nnsCancel={onCancel} on:nnsQRCode={onQRCode} />
  {/if}
</WizardModal>
