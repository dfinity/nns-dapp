<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import Address from "./Address.svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import { onMount } from "svelte";

  let address: number | undefined;
  let mounted: boolean = false;

  onMount(() => (mounted = true));

  // TODO(L2-430): continue implementation of the wizard
</script>

<div>
  <p>{$i18n.accounts.enter_address_or_select}</p>

  <Address bind:address />

  <!-- Prevent the component to be presented with a scroll offset when navigating between wizard steps -->
  {#if mounted}
    <SelectAccount
      displayTitle={true}
      disableSelection={address !== undefined && address !== 0}
    />
  {/if}
</div>

<style lang="scss">
  p {
    margin-bottom: calc(1.5 * var(--padding));
  }
</style>
