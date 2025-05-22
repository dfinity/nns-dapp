<script lang="ts">
  import { isBalancePrivacyOptionStore } from "$lib/derived/balance-privacy-active.derived";
  import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
  import { i18n } from "$lib/stores/i18n";
  import { IconEyeOpen, Toggle } from "@dfinity/gix-components";

  let checked = $derived($isBalancePrivacyOptionStore);

  const onToggle = () => {
    checked = !checked;
    balancePrivacyOptionStore.set(checked ? "hide" : "show");
  };
</script>

<div class="wrapper" data-tid="balance-privacy-option">
  <span class="text">
    <IconEyeOpen />
    {$i18n.navigation.toggle_balance_privacy_mode}
  </span>
  <Toggle
    bind:checked
    on:nnsToggle={onToggle}
    ariaLabel={$i18n.navigation.toggle_balance_privacy_mode}
  />
</div>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  .wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .text {
      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
    }
  }
</style>
