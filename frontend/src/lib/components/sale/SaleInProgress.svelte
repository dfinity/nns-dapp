<script lang="ts">
  import InProgress from "$lib/components/common/InProgress.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { SaleStep } from "$lib/types/sale";
  import type { ProgressStep } from "@dfinity/gix-components";

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
</script>

<InProgress {steps} {progressStep} />
