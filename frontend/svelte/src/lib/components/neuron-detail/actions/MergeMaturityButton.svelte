<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import MergeMaturityModal from "../../../modals/neurons/MergeMaturityModal.svelte";
  import Tooltip from "../../ui/Tooltip.svelte";
  import { replacePlaceholders } from "../../../utils/i18n.utils";
  import { formatICP } from "../../../utils/icp.utils";
  import { hasEnoughMaturityToMerge } from "../../../utils/neuron.utils";
  import { MIN_MATURITY_MERGE } from "../../../constants/neurons.constants";

  export let neuron: NeuronInfo;

  let isOpen: boolean = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);
</script>

<Tooltip
  id="merge-maturity-button"
  text={replacePlaceholders(
    $i18n.neuron_detail.merge_maturity_disabled_tooltip,
    {
      $amount: formatICP({value: BigInt(MIN_MATURITY_MERGE)}),
    }
  )}
>
  <button
    disabled={!hasEnoughMaturityToMerge(neuron)}
    class="primary small"
    on:click={showModal}>{$i18n.neuron_detail.merge_maturity}</button
  >
</Tooltip>

{#if isOpen}
  <MergeMaturityModal on:nnsClose={closeModal} {neuron} />
{/if}
