<script lang="ts">
  import { ProgressSteps, type ProgressStep } from "@dfinity/gix-components";
  import type { SaleStep } from "$lib/types/sale";

  export let progressStep: SaleStep;

  let steps: [ProgressStep, ...ProgressStep[]] = [
    {
      step: "initialization",
      text: "Connecting with sale canister",
      state: "next",
    } as ProgressStep,
    {
      step: "transfer",
      text: "Sending ICP",
      state: "next",
    } as ProgressStep,
    {
      step: "notify",
      text: "Confirming participation",
      state: "next",
    } as ProgressStep,
    {
      step: "reload",
      text: "Updating UI balances",
      state: "next",
    } as ProgressStep,
  ];

  const updateSteps = () => {
    const progressIndex = steps.findIndex(({ step }) => step === progressStep);

    steps = steps.map((step, index) =>
      step.step === progressStep
        ? {
            ...step,
            state: "in_progress",
          }
        : {
            ...step,
            state:
              index < progressIndex || progressStep === "done"
                ? "completed"
                : "next",
          }
    );
  };

  $: progressStep, (() => updateSteps())();
</script>

<div class="warning">
  <p class="value">This may take a few minutes</p>
  <p class="description">Please do not close your browser tab</p>
</div>

<ProgressSteps {steps} />

<style lang="scss">
  .warning {
    background: var(--overlay-background);
    color: var(--overlay-background-contrast);
    padding: var(--padding) var(--padding-3x);
    border-radius: var(--border-radius);

    margin: 0 0 var(--padding-4x);
  }
</style>
