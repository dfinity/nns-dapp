<script lang="ts">
  import { WizardModal } from "@dfinity/gix-components";
  import type { WizardStep, WizardSteps } from "@dfinity/gix-components";
  import TransactionQRCode from "$lib/components/transaction/TransactionQRCode.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";

  export let testId: string | undefined = undefined;
  export let steps: WizardStep[];
  export let currentStep: WizardStep | undefined = undefined;
  export let disablePointerEvents = false;

  const STEP_QRCODE = "QRCode";

  let stepsPlusQr: WizardStep;
  $: stepsPlusQr = [
    ...steps,
    {
      name: STEP_QRCODE,
      title: "",
    },
  ];

  let modal: WizardModal;

  export const next = () => {
    modal.next();
  };

  export const back = () => {
    modal.back();
  };

  export const set = (step: number) => {
    modal.set(step);
  };

  const setStepName = (stepName: string) => {
    const stepNumber = stepsPlusQr.findIndex(({ name }) => name === stepName);
    set(stepNumber);
  };

  let resolveQrCodePromise: (value: string | undefined) => void | undefined =
    undefined;

  export const scanQrCode = async () => {
    const prevStep = currentStep;

    setStepName(STEP_QRCODE);

    return new Promise<string | undefined>((resolve) => {
      resolveQrCodePromise = resolve;
    }).finally(() => {
      setStepName(prevStep.name);
    });
  };

  const onQRCode = ({ detail: value }: CustomEvent<string>) => {
    resolveQrCodePromise?.(value);
  };

  const onCancel = () => {
    resolveQrCodePromise?.(undefined);
  };
</script>

{#if nonNullish(stepsPlusQr)}
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
{/if}
