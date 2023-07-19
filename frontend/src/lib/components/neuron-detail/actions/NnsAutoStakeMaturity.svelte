<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    hasAutoStakeMaturityOn,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { getContext } from "svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import AutoStakeMaturityCheckbox from "./AutoStakeMaturityCheckbox.svelte";

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

<AutoStakeMaturityCheckbox
  bind:hasAutoStakeOn
  {disabled}
  on:nnsChange={() =>
    openNnsNeuronModal({
      type: "auto-stake-maturity",
      data: { neuron: $store.neuron },
    })}
/>
