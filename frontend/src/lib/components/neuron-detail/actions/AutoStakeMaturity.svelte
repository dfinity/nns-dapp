<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { hasAutoStakeMaturityOn } from "$lib/utils/neuron.utils";
  import { Checkbox } from "@dfinity/gix-components";
  import { getContext } from "svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";

  export let neuron: NeuronInfo;

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  const { toggleModal }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<div class="auto-stake">
  <Checkbox
    preventDefault
    inputId="auto-stake-maturity-checkbox"
    checked={hasAutoStakeOn}
    on:nnsChange={() => toggleModal("auto-stake-maturity")}
  >
    <span>{$i18n.neuron_detail.auto_stake_maturity}</span>
  </Checkbox>
</div>

<style lang="scss">
  .auto-stake {
    padding: var(--padding-2x) 0 0;

    --checkbox-label-order: 1;
    --checkbox-padding: var(--padding) 0;
  }
</style>
