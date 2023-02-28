<script lang="ts">
  import { ProgressSteps, type ProgressStep } from "@dfinity/gix-components";
  import { SaleStep } from "$lib/types/sale";
  import { ICON_SIZE_LARGE } from "$lib/constants/layout.constants";
  import { IconWarning } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let progressStep: SaleStep;

  let steps: [ProgressStep, ...ProgressStep[]] = [
    {
      step: SaleStep.INITIALIZATION,
      text: $i18n.sns_sale.step_initialization,
      state: "next",
    } as ProgressStep,
    {
      step: SaleStep.TRANSFER,
      text: $i18n.sns_sale.step_transfer,
      state: "next",
    } as ProgressStep,
    {
      step: SaleStep.NOTIFY,
      text: $i18n.sns_sale.step_notify,
      state: "next",
    } as ProgressStep,
    {
      step: SaleStep.RELOAD,
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
    ) as [ProgressStep, ...ProgressStep[]];
  };

  $: progressStep, (() => updateSteps())();
</script>

<div class="warning" data-tid="sale-in-progress-warning">
  <div class="icon">
    <IconWarning size={ICON_SIZE_LARGE} />
  </div>
  <p class="value">{$i18n.sns_sale.this_may_take_a_few_minutes}</p>
  <p class="description">{$i18n.sns_sale.do_not_close}</p>
</div>

<ProgressSteps {steps} />

<style lang="scss">
  .warning {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--padding-2x);
    align-items: center;

    background: var(--overlay-background);
    color: var(--overlay-background-contrast);
    padding: var(--padding) var(--padding-3x);
    border-radius: var(--border-radius);

    margin: 0 0 var(--padding-4x);
  }

  .icon {
    color: var(--warning-emphasis);
    grid-row: 1/3;
  }

  .value {
    margin-bottom: 0;
  }

  .description {
    grid-column: 2/3;
    margin-top: var(--padding-0_5x);
  }
</style>
