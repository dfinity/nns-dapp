<script lang="ts">
  import { getContext } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    type AccountType,
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "$lib/types/add-account.context";
  import { Card } from "@dfinity/gix-components";

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const select = async (type: AccountType) => await context.selectType(type);
  const selectNewSubAccount = async () => await select("subAccount");
  const selectNewHardwareWallet = async () => await select("hardwareWallet");
</script>

<Card role="button"
      on:click={selectNewSubAccount}
      testId="choose-linked-as-account-type"
>
  <h4>{$i18n.accounts.new_linked_title}</h4>
  <span>{$i18n.accounts.new_linked_subtitle}</span>
</Card>
<Card role="button"
      on:click={selectNewHardwareWallet}
      testId="choose-hardware-wallet-as-account-type"
>
  <h4>{$i18n.accounts.attach_hardware_title}</h4>
  <span>{$i18n.accounts.attach_hardware_subtitle}</span>
</Card>

<style lang="scss">
  span {
    margin-bottom: var(--padding-0_5x);
  }
</style>
