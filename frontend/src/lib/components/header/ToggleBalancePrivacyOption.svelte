<script lang="ts">
  import { isBalancePrivacyOptionStore } from "$lib/derived/balance-privacy-active.derived";
  import { analytics } from "$lib/services/analytics.services";
  import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
  import { i18n } from "$lib/stores/i18n";
  import { IconEyeClosed, IconEyeOpen, Toggle } from "@dfinity/gix-components";

  let checked = $derived($isBalancePrivacyOptionStore);
  const label = $derived(
    checked
      ? $i18n.navigation.privacy_mode_show
      : $i18n.navigation.privacy_mode_hide
  );
  const Icon = $derived(checked ? IconEyeOpen : IconEyeClosed);

  const toggle = () => {
    checked = !checked;

    const newState = checked ? "hide" : "show";
    balancePrivacyOptionStore.set(newState);
    analytics.event("privacy-mode-toggle", {
      value: newState,
    });
  };
</script>

<button
  class="wrapper"
  onclick={toggle}
  aria-label={label}
  data-tid="toggle-balance-privacy-option-component"
>
  <span class="text">
    <Icon />
    <span data-tid="label">
      {label}
    </span>
  </span>
  <Toggle bind:checked ariaLabel={label} on:nnsToggle={toggle} />
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  .wrapper {
    @include account-menu.button;
    justify-content: space-between;
    padding: 0;
    cursor: pointer;

    .text {
      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
    }
  }
</style>
