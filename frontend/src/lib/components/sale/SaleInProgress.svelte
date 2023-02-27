<script lang="ts">
  import { ProgressSteps, type ProgressStep } from "@dfinity/gix-components";
  import type { SaleStep } from "$lib/types/sale";
  import {i18n} from "$lib/stores/i18n";

  export let progressStep: SaleStep;

  let steps: [ProgressStep, ...ProgressStep[]] = [
    {
      step: "initialization",
      text: $i18n.sns_sale.step_initialization,
      state: "next",
    } as ProgressStep,
    {
      step: "transfer",
      text: $i18n.sns_sale.step_transfer,
      state: "next",
    } as ProgressStep,
    {
      step: "notify",
      text: $i18n.sns_sale.step_notify,
      state: "next",
    } as ProgressStep,
    {
      step: "reload",
      text: $i18n.sns_sale.step_reload,
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
  <p class="value">{$i18n.sns_sale.this_may_take_a_few_minutes}</p>
  <p class="description">{$i18n.sns_sale.do_not_close}</p>
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
