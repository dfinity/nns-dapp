<script lang="ts">
  import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";

  export let variant: string | undefined = undefined;
  export let increaseStakeCallback: () => void | undefined = undefined;
</script>

<IncreaseStakeButton {variant} on:increaseStake={increaseStakeCallback} />
