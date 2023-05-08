<script lang="ts">
  import type { ProgressStep } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import InProgress from "$lib/components/common/InProgress.svelte";
  import { ConvertBtcStep } from "$lib/types/ckbtc-convert";

  export let progressStep: ConvertBtcStep;
  export let transferToLedgerStep = true;

  let steps: [ProgressStep, ...ProgressStep[]] = [
    {
      step: ConvertBtcStep.INITIALIZATION,
      text: $i18n.ckbtc.step_initialization,
      state: "next",
    } as ProgressStep,
    ...(transferToLedgerStep
      ? [
          {
            step: ConvertBtcStep.LOCKING_CKBTC,
            text: $i18n.ckbtc.step_locking_ckbtc,
            state: "next",
          } as ProgressStep,
        ]
      : []),
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
