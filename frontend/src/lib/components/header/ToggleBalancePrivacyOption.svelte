<script lang="ts">
  import { isBalancePrivacyOptionStore } from "$lib/derived/balance-privacy-active.derived";
  import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
  import { i18n } from "$lib/stores/i18n";
  import { IconEyeOpen, Toggle } from "@dfinity/gix-components";

  let checked = $derived($isBalancePrivacyOptionStore);

  const onclick = () => {
    checked = !checked;
    balancePrivacyOptionStore.set(checked ? "hide" : "show");
  };
</script>

<button
  class="wrapper"
  {onclick}
  aria-label={$i18n.navigation.toggle_balance_privacy_mode}
  data-tid="toggle-balance-privacy-option-component"
>
  <span class="text">
    <IconEyeOpen />
    {$i18n.navigation.toggle_balance_privacy_mode}
  </span>
  <Toggle
    bind:checked
    ariaLabel={$i18n.navigation.toggle_balance_privacy_mode}
  />
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  .wrapper {
    @include account-menu.button;
    justify-content: space-between;
    padding: 0;

    .text {
      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
    }
  }
</style>
