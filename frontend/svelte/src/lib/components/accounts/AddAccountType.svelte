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
    testId="choose-linked-as-account-type"
  >
    <svelte:fragment slot="title"
      >{$i18n.accounts.new_linked_title}</svelte:fragment
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.accounts.new_linked_subtitle}</svelte:fragment
    >
  </CardItem>
  <CardItem
    on:click={selectNewHardwareWallet}
    testId="choose-hardware-wallet-as-account-type"
  >
    <svelte:fragment slot="title"
      >{$i18n.accounts.attach_hardware_title}</svelte:fragment
    >
    <svelte:fragment slot="subtitle"
      >{$i18n.accounts.attach_hardware_subtitle}</svelte:fragment
    >
  </CardItem>
</div>

<style lang="scss">
  .wizard-wrapper {
    // Need to overwrite the default of wizrd-wrapper
    justify-content: center !important;
  }
</style>
