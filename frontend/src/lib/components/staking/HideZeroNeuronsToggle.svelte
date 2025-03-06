<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Toggle } from "@dfinity/gix-components";
  import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";

  let checked = false;
  $: checked = $hideZeroNeuronsStore === "hide";

  const toggle = () => {
    hideZeroNeuronsStore.set(checked ? "show" : "hide");
  };
</script>

<div class="popup-content" data-tid="hide-zero-neurons-toggle-component">
  <div class="popup-header">
    {$i18n.staking.hide_no_neurons_header}
  </div>
  <div class="toggle-label">
    {$i18n.staking.hide_no_neurons_toggle_label}
    <Toggle
      {checked}
      on:nnsToggle={toggle}
      ariaLabel={$i18n.staking.hide_no_neurons_toggle_label}
    />
  </div>
</div>

<style lang="scss">
  .popup-content {
    display: flex;
    flex-direction: column;
    width: calc(30 * var(--padding));
    gap: var(--padding-0_5x);
  }

  .popup-header {
    font-size: var(--font-size-small);
    color: var(--text-description);
  }

  .toggle-label {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-standard);
  }
</style>
