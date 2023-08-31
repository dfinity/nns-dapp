<script lang="ts">
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";
</script>

<IncreaseStakeButton
  on:increaseStake={() =>
    openSnsNeuronModal({
      type: "increase-stake",
    })}
/>
