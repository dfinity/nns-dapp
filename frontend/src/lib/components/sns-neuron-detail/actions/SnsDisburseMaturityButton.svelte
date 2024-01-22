<script lang="ts">
  import {
    hasEnoughMaturityToDisburse,
    minimumAmountToDisburseMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import DisburseMaturityButton from "$lib/components/neuron-detail/actions/DisburseMaturityButton.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { i18n } from "$lib/stores/i18n";
  import type { TokenAmountV2 } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let fee: TokenAmountV2;

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToDisburse({
    neuron,
    fee: fee.toUlps(),
  });

  let disabledText: string | undefined = undefined;
  $: disabledText = !enoughMaturity
    ? neuron.maturity_e8s_equivalent === 0n
      ? $i18n.neuron_detail.disburse_maturity_disabled_tooltip_zero
      : replacePlaceholders(
          $i18n.neuron_detail.disburse_maturity_disabled_tooltip_non_zero,
          {
            $amount: formatTokenE8s({
              value: minimumAmountToDisburseMaturity(fee.toUlps()),
            }),
          }
        )
    : undefined;

  const showModal = () => openSnsNeuronModal({ type: "disburse-maturity" });
</script>

<DisburseMaturityButton {disabledText} on:click={showModal} />
