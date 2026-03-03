<script lang="ts">
  import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { hasEnoughMaturityToStake } from "$lib/utils/neuron.utils";
  import { NeuronState, type NeuronInfo } from "@icp-sdk/canisters/nns";
  import { getContext } from "svelte";

  type Props = {
    neuron: NeuronInfo;
  };

  const { neuron }: Props = $props();

  const disabledText = $derived.by(() => {
    if (neuron.state === NeuronState.Dissolved) {
      return $i18n.neuron_detail.stake_maturity_disabled_tooltip_dissolved;
    }
    if (!hasEnoughMaturityToStake(neuron)) {
      return $i18n.neuron_detail.stake_maturity_disabled_tooltip;
    }
    return undefined;
  });

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );

  const showModal = () =>
    openNnsNeuronModal({
      type: "stake-maturity",
      data: { neuron: $store.neuron },
    });
</script>

<StakeMaturityButton {disabledText} onclick={showModal} />
