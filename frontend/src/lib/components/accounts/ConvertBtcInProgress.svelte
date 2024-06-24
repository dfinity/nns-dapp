<script lang="ts">
  import InProgress from "$lib/components/common/InProgress.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
  import type { ProgressStep } from "@dfinity/gix-components";

  export let progressStep: ConvertBtcStep;

  let steps: [ProgressStep, ...ProgressStep[]] = [
    {
      step: ConvertBtcStep.APPROVE_TRANSFER,
      text: $i18n.ckbtc.step_approve_transfer,
      state: "next",
    } as ProgressStep,
    {
      step: ConvertBtcStep.SEND_BTC,
      text: $i18n.ckbtc.step_send_btc,
      state: "next",
    } as ProgressStep,
    {
      step: ConvertBtcStep.RELOAD,
      text: $i18n.ckbtc.step_reload,
      state: "next",
    } as ProgressStep,
  ];
</script>

<InProgress {steps} {progressStep} />
