<script lang="ts">
  import { ICP, type NeuronInfo } from "@dfinity/nns";
  import { MIN_NEURON_STAKE } from "../../../constants/neurons.constants";
  import SpawnNeuronModal from "../../../modals/neurons/SpawnNeuronModal.svelte";
  import { accountsStore } from "../../../stores/accounts.store";
  import { i18n } from "../../../stores/i18n";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { formatICP } from "../../../utils/icp.utils";
  import {
    isEnoughToStakeNeuron,
    isNeuronControlledByHardwareWallet,
  } from "../../../utils/neuron.utils";
  import Tooltip from "../../ui/Tooltip.svelte";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;
  let controlledByHarwareWallet: boolean;
  $: controlledByHarwareWallet = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: $accountsStore,
  });
  const showModal = async () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let isEnoughMaturity: boolean;
  $: isEnoughMaturity =
    neuron.fullNeuron === undefined
      ? false
      : isEnoughToStakeNeuron({
          stake: ICP.fromE8s(neuron.fullNeuron.maturityE8sEquivalent),
        });
</script>

<Tooltip
  id="spawn-maturity-button"
  text={replacePlaceholders(
    $i18n.neuron_detail.spawn_maturity_disabled_tooltip,
    {
      $amount: formatICP({ value: BigInt(MIN_NEURON_STAKE) }),
      detailed: true
    }
  )}
>
  <button
    disabled={!isEnoughMaturity}
    class="primary small"
    on:click={showModal}
  >
    {$i18n.neuron_detail.spawn_neuron}
  </button>
</Tooltip>

{#if isOpen}
  <SpawnNeuronModal
    on:nnsClose={closeModal}
    {neuron}
    {controlledByHarwareWallet}
  />
{/if}
