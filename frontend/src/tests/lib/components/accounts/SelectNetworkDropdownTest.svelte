<script lang="ts">
  import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";

  let selectedNetwork = undefined;
</script>

<div class={`container ${selectedNetwork}`}>
  <SelectNetworkDropdown bind:selectedNetwork />
</div>
