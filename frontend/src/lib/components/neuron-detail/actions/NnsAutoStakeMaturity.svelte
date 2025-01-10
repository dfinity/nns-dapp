<script lang="ts">
  import AutoStakeMaturity from "$lib/components/neuron-detail/actions/AutoStakeMaturity.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    hasAutoStakeMaturityOn,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  let disabled: boolean;
  $: disabled = !isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<AutoStakeMaturity
  bind:hasAutoStakeOn
  {disabled}
  on:nnsChange={() =>
    openNnsNeuronModal({
      type: "auto-stake-maturity",
      data: { neuron: $store.neuron },
    })}
/>
