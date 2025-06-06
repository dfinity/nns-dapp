<script lang="ts">
  import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";
  import { i18n } from "$lib/stores/i18n";
  import { Toggle } from "@dfinity/gix-components";

  const checked = $derived($hideZeroNeuronsStore === "hide");

  const toggle = () => {
    hideZeroNeuronsStore.set(checked ? "show" : "hide");
  };
</script>

<div class="content" data-tid="hide-zero-neurons-toggle-component">
  <div class="header">
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
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .header {
    font-size: var(--font-size-small);
    color: var(--text-description);
  }

  .toggle-label {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-standard);
  }
</style>
