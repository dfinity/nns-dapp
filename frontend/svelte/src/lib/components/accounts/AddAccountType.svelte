<script lang="ts">
  import { getContext } from "svelte";
  import { i18n } from "../../stores/i18n";
  import {
    type AccountType,
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "../../types/add-account.context";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const select = async (type: AccountType) => await context.selectType(type);
  const selectNewSubAccount = async () => await select("subAccount");
  const selectNewHardwareWallet = async () => await select("hardwareWallet");
</script>

<div class="wizard-wrapper">
  <div
    class="card-item"
    role="button"
    on:click={selectNewSubAccount}
    data-tid="choose-linked-as-account-type"
  >
    <h4>{$i18n.accounts.new_linked_title}</h4>
    <span>{$i18n.accounts.new_linked_subtitle}</span>
  </div>
  <div
    class="card-item"
    role="button"
    on:click={selectNewHardwareWallet}
    data-tid="choose-hardware-wallet-as-account-type"
  >
    <h4>{$i18n.accounts.attach_hardware_title}</h4>
    <span>{$i18n.accounts.attach_hardware_subtitle}</span>
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media";

  .wizard-wrapper {
    justify-content: center;
  }

  .card-item {
    padding: var(--padding-2x) var(--padding);
    border-radius: var(--border-radius);

    @include media.min-width(medium) {
      padding: var(--padding-4x);
    }

    @include interaction.tappable;

    &:hover {
      background: var(--background-hover);
    }

    h4 {
      line-height: 1;
      margin-bottom: var(--padding);
    }

    span {
      color: var(--gray-200);
    }
  }
</style>
