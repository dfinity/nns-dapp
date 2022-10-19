<script lang="ts">
  import AddSubAccount from "$lib/components/accounts/AddSubAccount.svelte";
  import AddAccountType from "$lib/components/accounts/AddAccountType.svelte";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import HardwareWalletName from "$lib/components/accounts/HardwareWalletName.svelte";
  import { setContext, tick } from "svelte";
  import HardwareWalletConnect from "$lib/components/accounts/HardwareWalletConnect.svelte";
  import { writable } from "svelte/store";
  import type {
    AddAccountContext,
    AddAccountStore,
    AccountType,
  } from "$lib/types/add-account.context";
  import { ADD_ACCOUNT_CONTEXT_KEY } from "$lib/types/add-account.context";
  import { debugAddAccountStore } from "$lib/stores/debug.store";

  const subAccountSteps: WizardSteps = [
    {
      name: "AddSubAccount",
      title: $i18n.accounts.new_linked_title,
    },
  ];

  const hardwareWalletSteps: WizardSteps = [
    {
      name: "HardwareWalletName",
      title: $i18n.accounts.attach_hardware_title,
    },
    {
      name: "HardwareWalletConnect",
      title: $i18n.accounts.attach_hardware_title,
    },
  ];

  const startStep: WizardStep = {
    name: "AddAccountType",
    title: $i18n.accounts.add_account,
  };

  let steps: WizardSteps = [startStep, ...subAccountSteps];

  /**
   * A store that contains the type of account that will be added (subaccount or hardware wallet) and addition data that can be used across multiple steps of the wizard.
   */
  const addAccountStore = writable<AddAccountStore>({
    type: undefined,
    hardwareWalletName: undefined,
  });

  debugAddAccountStore(addAccountStore);

  const selectType = async (type: AccountType) => {
    // Set the type in store and reset other values only if the new type is not the one that was previously used - e.g. user first select hardware wallet, entered a name, clicked continue, went twice back and go to subaccount
    addAccountStore.update(({ type: previousType, hardwareWalletName }) => ({
      type,
      hardwareWalletName:
        previousType === type ? hardwareWalletName : undefined,
    }));

    // We preserve the first step in the array because we want the current first step to *not* be re-rendered. It would cause a flickering of the content of the modal.
    steps.splice(1, steps.length);
    steps.push(
      ...(type === "hardwareWallet" ? hardwareWalletSteps : subAccountSteps)
    );

    // Wait steps to be applied - components to be updated - before being able to navigate to next step
    await tick();

    modal.next();
  };

  setContext<AddAccountContext>(ADD_ACCOUNT_CONTEXT_KEY, {
    store: addAccountStore,
    selectType,
    next: () => modal?.next(),
    back: () => modal?.back(),
  });

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? $i18n.accounts.add_account}</svelte:fragment
  >

  <svelte:fragment>
    {#if currentStep?.name === "AddAccountType"}
      <AddAccountType />
    {/if}
    {#if currentStep?.name === "AddSubAccount"}
      <AddSubAccount on:nnsClose />
    {/if}
    {#if currentStep?.name === "HardwareWalletName"}
      <HardwareWalletName />
    {/if}
    {#if currentStep?.name === "HardwareWalletConnect"}
      <HardwareWalletConnect on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
