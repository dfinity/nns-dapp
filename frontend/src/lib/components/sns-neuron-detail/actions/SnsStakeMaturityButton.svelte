<script lang="ts">
  import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import {
    getSnsNeuronState,
    hasEnoughMaturityToStake,
  } from "$lib/utils/sns-neuron.utils";
  import { NeuronState } from "@icp-sdk/canisters/nns";
  import type { SnsGovernanceDid } from "@icp-sdk/canisters/sns";

  type Props = {
    neuron: SnsGovernanceDid.Neuron;
  };

  const { neuron }: Props = $props();

  const disabledText = $derived.by(() => {
    if (getSnsNeuronState(neuron) === NeuronState.Dissolved) {
      return $i18n.neuron_detail.stake_maturity_disabled_tooltip_dissolved;
    }
    if (!hasEnoughMaturityToStake(neuron)) {
      return $i18n.neuron_detail.stake_maturity_disabled_tooltip;
    }
    return undefined;
  });

  const showModal = () => openSnsNeuronModal({ type: "stake-maturity" });
</script>

<StakeMaturityButton {disabledText} onclick={showModal} />
