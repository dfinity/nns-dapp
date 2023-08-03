<script lang="ts">
  // TODO: Delete this file
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";

  export let variant: "primary" | "secondary" = "primary";
</script>

<IncreaseStakeButton
  {variant}
  on:increaseStake={() =>
    openSnsNeuronModal({
      type: "increase-stake",
    })}
/>
