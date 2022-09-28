<script lang="ts">
  import NeuronConfirmActionScreen from "../../../../lib/components/neuron-detail/NeuronConfirmActionScreen.svelte";

  export let spy: () => void = () => undefined;
</script>

<NeuronConfirmActionScreen on:nnsConfirm={spy}>
  <h3 slot="main-info" data-tid="test-main-info">Main information</h3>
  <svelte:fragment slot="button-content">Confirm</svelte:fragment>
</NeuronConfirmActionScreen>
