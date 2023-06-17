<script lang="ts">
  import { ProgressSteps, type ProgressStep } from "@dfinity/gix-components";
  import { ICON_SIZE_LARGE } from "$lib/constants/layout.constants";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { IconWarning } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  // The current step of the process that is in progress
  export let progressStep: string;
  export let steps: [ProgressStep, ...ProgressStep[]];

  let dynamicSteps: [ProgressStep, ...ProgressStep[]] = [...steps];

  const updateSteps = () => {
    const progressIndex = dynamicSteps.findIndex(
      ({ step }) => step === progressStep
    );

    dynamicSteps = dynamicSteps.map((step, index) =>
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

  $: progressStep, updateSteps();
</script>

<TestIdWrapper testId="in-progress-component">
  <div class="warning" data-tid="in-progress-warning">
    <div class="icon">
      <IconWarning size={ICON_SIZE_LARGE} />
    </div>
    <p class="value">{$i18n.core.this_may_take_a_few_minutes}</p>
    <p class="description">{$i18n.core.do_not_close}</p>
  </div>

  <ProgressSteps steps={dynamicSteps} />
</TestIdWrapper>

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
