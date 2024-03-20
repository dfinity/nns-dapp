<script lang="ts">
  import { Toggle } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";

  let checked = false;
  $: checked = $hideZeroBalancesStore === "hide";

  const toggle = () => {
    hideZeroBalancesStore.set(checked ? "show" : "hide");
  };
</script>

<div class="popup-content" data-tid="hide-zero-balances-toggle-component">
  <div class="popup-header">
    {$i18n.tokens.balance_header}
  </div>
  <div class="toggle-label">
    {$i18n.tokens.hide_zero_balances}
    <Toggle
      {checked}
      on:nnsToggle={toggle}
      ariaLabel={$i18n.tokens.hide_zero_balances_toggle_label}
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
