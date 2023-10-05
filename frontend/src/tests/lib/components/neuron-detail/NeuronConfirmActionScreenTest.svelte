<script lang="ts">
  import NeuronConfirmActionScreen from "$lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";

  export let spy: () => void = () => undefined;
  export let editLabel: string | undefined = undefined;
</script>

<NeuronConfirmActionScreen on:nnsConfirm={spy} {editLabel}>
  <h3 data-tid="test-main-info">Main information</h3>
</NeuronConfirmActionScreen>
