<script lang="ts">
  import ConfirmActionScreen from "../../../../lib/components/ui/ConfirmActionScreen.svelte";

  export let loading: boolean = false;
  export let spy: () => void = () => undefined;
</script>

<ConfirmActionScreen {loading} on:nnsConfirm={spy}>
  <h3 slot="main-info" data-tid="test-main-info">Main information</h3>
  <svelte:fragment slot="button-content">Confirm</svelte:fragment>
</ConfirmActionScreen>
