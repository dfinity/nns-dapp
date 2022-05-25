<script lang="ts">
  import { getContext } from "svelte";
  import { i18n } from "../../stores/i18n";
  import {
    type AccountType,
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "../../types/add-account.context";
  import CardItem from "../ui/CardItem.svelte";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const select = async (type: AccountType) => await context.selectType(type);
  const selectNewSubAccount = async () => await select("subAccount");
  const selectNewHardwareWallet = async () => await select("hardwareWallet");
</script>

<div class="wizard-wrapper">
  <CardItem
    on:click={selectNewSubAccount}
    title={$i18n.accounts.new_linked_title}
    subtitle={$i18n.accounts.new_linked_subtitle}
    testId="choose-linked-as-account-type"
  />
  <CardItem
    on:click={selectNewHardwareWallet}
    title={$i18n.accounts.attach_hardware_title}
    subtitle={$i18n.accounts.attach_hardware_subtitle}
    testId="choose-hardware-wallet-as-account-type"
  />
</div>

<style lang="scss">
  .wizard-wrapper {
    // Need to overwrite the default of wizrd-wrapper
    justify-content: center !important;
  }
</style>
