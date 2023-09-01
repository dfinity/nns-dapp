<script lang="ts">
  import { WizardModal } from "@dfinity/gix-components";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import TransactionQRCode from "$lib/components/transaction/TransactionQRCode.svelte";

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

  let resolveQrCodePromise: ((value: string | undefined) => void) | undefined =
    undefined;

  export const scanQrCode = async () => {
    const prevStep = currentStep;

    goStep(STEP_QRCODE);

    return new Promise<string | undefined>((resolve) => {
      resolveQrCodePromise = resolve;
    }).finally(() => {
      // TypeScript can't know that currentStep is defined before scanQrCode
      // will be called.
      goStep(prevStep?.name || steps[0].name);
    });
  };

  const onQRCode = ({ detail: value }: CustomEvent<string>) => {
    resolveQrCodePromise?.(value);
    resolveQrCodePromise = undefined;
  };

  const onCancel = () => {
    resolveQrCodePromise?.(undefined);
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
