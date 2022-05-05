<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { MIN_MATURITY } from "../../../constants/neurons.constants";
  import SpawnNeuronModal from "../../../modals/neurons/SpawnNeuronModal.svelte";
  import { i18n } from "../../../stores/i18n";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { formatICP } from "../../../utils/icp.utils";
  import { hasEnoughMaturity } from "../../../utils/neuron.utils";
  import Tooltip from "../../ui/Tooltip.svelte";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);
</script>

<Tooltip
  id="spawn-maturity-button"
  text={replacePlaceholders(
    $i18n.neuron_detail.spawn_maturity_disabled_tooltip,
    {
      $amount: formatICP(BigInt(MIN_MATURITY)),
    }
  )}
>
  <button
    disabled={!hasEnoughMaturity(neuron)}
    class="primary small"
    on:click={showModal}>{$i18n.neuron_detail.spawn_neuron}</button
  >
</Tooltip>

{#if isOpen}
  <SpawnNeuronModal on:nnsClose={closeModal} {neuron} />
{/if}
