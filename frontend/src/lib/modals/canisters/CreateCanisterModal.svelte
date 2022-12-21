<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import SelectAccount from "$lib/components/accounts/SelectAccount.svelte";
  import ConfirmCyclesCanister from "$lib/components/canisters/ConfirmCyclesCanister.svelte";
  import {
    createCanister,
    getIcpToCyclesExchangeRate,
  } from "$lib/services/canisters.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsShow } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import SelectCyclesCreateCanister from "$lib/components/canisters/SelectCyclesCreateCanister.svelte";

  let icpToCyclesExchangeRate: bigint | undefined;
  onMount(
    async () => (icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate())
  );

  const steps: WizardSteps = [
    {
      name: "SelectAccount",
      title: $i18n.accounts.select_source,
    },
    {
      name: "SelectCycles",
      title: $i18n.canisters.enter_amount,
    },
    {
      name: "ConfirmCycles",
      title: $i18n.canisters.review_create_canister,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;
  let account: Account | undefined;
  let amount: number | undefined;

  const onSelectAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    account = detail.selectedAccount;
    modal.next();
  };

  const selectAmount = () => {
    modal.next();
  };

  const dispatcher = createEventDispatcher();
  const create = async () => {
    // Edge case, should not happen
    if (amount === undefined || account === undefined) {
      toastsError({
        labelKey: "error.unknown",
      });
      return;
    }
    startBusy({
      initiator: "create-canister",
      labelKey: "busy_screen.take_long",
    });
    const canisterId = await createCanister({
      amount,
      account,
    });
    stopBusy("create-canister");
    if (canisterId !== undefined) {
      toastsShow({
        level: "success",
        labelKey: "canisters.create_canister_success",
        substitutions: {
          $canisterId: canisterId.toText(),
        },
      });
      dispatcher("nnsClose");
    }
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="create-canister-modal-title"
      >{currentStep?.title ?? $i18n.canisters.add_canister}</span
    ></svelte:fragment
  >
  <svelte:fragment>
    {#if currentStep?.name === "SelectAccount"}
      <SelectAccount
        hideHardwareWalletAccounts
        on:nnsSelectAccount={onSelectAccount}
      />
    {/if}
    {#if currentStep?.name === "SelectCycles"}
      <SelectCyclesCreateCanister
        {icpToCyclesExchangeRate}
        bind:amount
        on:nnsClose
        on:nnsBack={modal.back}
        on:nnsSelectAmount={selectAmount}
      />
    {/if}
    {#if currentStep?.name === "ConfirmCycles" && amount !== undefined && account !== undefined}
      <ConfirmCyclesCanister
        {account}
        {icpToCyclesExchangeRate}
        {amount}
        on:nnsConfirm={create}
        on:nnsClose
        on:nnsBack={modal.back}
      />
    {/if}
  </svelte:fragment>
</WizardModal>
