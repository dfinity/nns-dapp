<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { E8S_PER_ICP } from "../../../constants/icp.constants";
  import {
    MIN_NEURON_STAKE,
    SPAWN_VARIANCE_PERCENTAGE,
  } from "../../../constants/neurons.constants";
  import SpawnNeuronModal from "../../../modals/neurons/SpawnNeuronModal.svelte";
  import { accountsStore } from "../../../stores/accounts.store";
  import { i18n } from "../../../stores/i18n";
  import { formatNumber, formatPercentage } from "../../../utils/format.utils";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import {
    isEnoughMaturityToSpawn,
    isNeuronControlledByHardwareWallet,
  } from "../../../utils/neuron.utils";
  import Tooltip from "../../ui/Tooltip.svelte";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;
  let controlledByHardwareWallet: boolean;
  $: controlledByHardwareWallet = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: $accountsStore,
  });
  const showModal = async () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let enoughMaturity: boolean;
  $: enoughMaturity =
    neuron.fullNeuron === undefined
      ? false
      : isEnoughMaturityToSpawn({
          neuron,
          percentage: 100,
        });
</script>

{#if enoughMaturity}
  <button class="primary small" on:click={showModal}>
    {$i18n.neuron_detail.spawn_neuron}
  </button>
{:else}
  <Tooltip
    id="spawn-maturity-button"
    text={replacePlaceholders(
      $i18n.neuron_detail.spawn_maturity_disabled_tooltip,
      {
        $amount: formatNumber(
          MIN_NEURON_STAKE / E8S_PER_ICP / SPAWN_VARIANCE_PERCENTAGE,
          { minFraction: 4, maxFraction: 4 }
        ),
        $min: formatNumber(MIN_NEURON_STAKE / E8S_PER_ICP, {
          minFraction: 0,
          maxFraction: 0,
        }),
        $varibility: formatPercentage(SPAWN_VARIANCE_PERCENTAGE, {
          minFraction: 0,
          maxFraction: 0,
        }),
      }
    )}
  >
    <button disabled class="primary small" on:click={showModal}>
      {$i18n.neuron_detail.spawn_neuron}
    </button>
  </Tooltip>
{/if}

{#if isOpen}
  <SpawnNeuronModal
    on:nnsClose={closeModal}
    {neuron}
    {controlledByHardwareWallet}
  />
{/if}
