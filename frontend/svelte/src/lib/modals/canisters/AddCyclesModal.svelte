<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import ConfirmCyclesCanister from "../../components/canisters/ConfirmCyclesCanister.svelte";
  import SelectCyclesCanister from "../../components/canisters/SelectCyclesCanister.svelte";
  import {
    getIcpToCyclesExchangeRate,
    topUpCanister,
  } from "../../services/canisters.services";
  import { i18n } from "../../stores/i18n";
  import type { Step, Steps } from "../../stores/steps.state";
  import type { Account } from "../../types/account";
  import WizardModal from "../WizardModal.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../types/canister-detail.context";
  import CanisterIdInfo from "../../components/canisters/CanisterIdInfo.svelte";

  let icpToCyclesExchangeRate: bigint | undefined;
  onMount(async () => {
    icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate();
  });

  const steps: Steps = [
    {
      name: "SelectAccount",
      title: $i18n.canister_detail.top_up_canister,
      showBackButton: true,
    },
    {
      name: "SelectCycles",
      title: $i18n.canisters.enter_amount,
      showBackButton: true,
    },
    {
      name: "ConfirmCycles",
      title: $i18n.canisters.review_cycles_purchase,
      showBackButton: true,
    },
  ];

  const { store, reloadDetails }: CanisterDetailsContext =
    getContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY);

  let currentStep: Step | undefined;
  let modal: WizardModal;
  let account: Account | undefined;
  let amount: number | undefined;
  let canisterId: Principal | undefined;
  $: canisterId = $store.info?.canister_id;

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
  const addCycles = async () => {
    // Edge case, should not happen
    if (
      amount === undefined ||
      account === undefined ||
      canisterId === undefined
    ) {
      toastsStore.error({
        labelKey: "error.unknown",
      });
      return;
    }
    startBusy({
      initiator: "top-up-canister",
    });
    const { success } = await topUpCanister({
      amount,
      canisterId,
      fromSubAccount: account.subAccount,
    });
    await reloadDetails(canisterId);
    stopBusy("top-up-canister");
    if (success) {
      toastsStore.success({
        labelKey: "canister_detail.top_up_successful",
      });
      dispatcher("nnsClose");
    }
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="top-up-canister-modal-title"
      >{currentStep?.title ?? $i18n.accounts.select_source}</span
    ></svelte:fragment
  >
  <svelte:fragment>
    {#if currentStep?.name === "SelectAccount"}
      <SelectAccount
        hideHardwareWalletAccounts
        on:nnsSelectAccount={onSelectAccount}
      />
    {/if}
    {#if currentStep?.name === "SelectCycles" && account !== undefined}
      <SelectCyclesCanister
        {icpToCyclesExchangeRate}
        bind:amount
        on:nnsClose
        on:nnsSelectAmount={selectAmount}
      >
        <p>{$i18n.canisters.transaction_fee}</p>
        <div>
          <div>
            <h5>{$i18n.accounts.source}</h5>
            <p>{account?.identifier}</p>
          </div>
          <div>
            <CanisterIdInfo {canisterId} />
          </div>
        </div>
      </SelectCyclesCanister>
    {/if}
    {#if currentStep?.name === "ConfirmCycles" && amount !== undefined && account !== undefined}
      <ConfirmCyclesCanister
        {account}
        {icpToCyclesExchangeRate}
        {amount}
        on:nnsClose
        on:nnsConfirm={addCycles}
      >
        <div>
          <CanisterIdInfo {canisterId} />
        </div>
      </ConfirmCyclesCanister>
    {/if}
  </svelte:fragment>
</WizardModal>
