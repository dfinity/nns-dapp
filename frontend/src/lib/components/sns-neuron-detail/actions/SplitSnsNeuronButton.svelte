<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import { neuronCanBeSplit } from "$lib/utils/sns-neuron.utils";
  import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { minNeuronSplittable } from "$lib/utils/sns-neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { Token } from "@dfinity/nns";
  import { formatToken } from "$lib/utils/token.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import {snsSelectedTransactionFeeStore} from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import {TokenAmount} from "@dfinity/nns";

  export let neuron: SnsNeuron;
  export let parameters: NervousSystemParameters;
  export let token: Token;

  let neuronMinimumStake: bigint;
  $: neuronMinimumStake = fromDefinedNullable(
    parameters.neuron_minimum_stake_e8s
  );

  let fee: TokenAmount;
  $: fee = $snsSelectedTransactionFeeStore;

  let splittable: boolean;
  $: splittable = neuronCanBeSplit({
    neuron,
    fee: fee.toE8s(),
    neuronMinimumStake,
  });
</script>

{#if splittable}
  <button
    class="secondary"
    on:click={() => openSnsNeuronModal({ type: "split-neuron" })}
    data-tid="disburse-button">{$i18n.neuron_detail.split_neuron}</button
  >
{:else}
  <Tooltip
    id="split-neuron-button"
    text={replacePlaceholders(
      $i18n.sns_neuron_detail.split_neuron_disabled_tooltip,
      {
        $amount: formatToken({
          value: BigInt(minNeuronSplittable({ fee, neuronMinimumStake })),
          detailed: true,
        }),
        $token: token.symbol,
      }
    )}
  >
    <button class="secondary" disabled
      >{$i18n.neuron_detail.split_neuron}</button
    >
  </Tooltip>
{/if}
