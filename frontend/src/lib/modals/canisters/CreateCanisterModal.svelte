<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import ConfirmCyclesCanister from "../../components/canisters/ConfirmCyclesCanister.svelte";
  import SelectCyclesCanister from "../../components/canisters/SelectCyclesCanister.svelte";
  import { NEW_CANISTER_MIN_T_CYCLES } from "../../constants/canisters.constants";
  import {
    createCanister,
    getIcpToCyclesExchangeRate,
  } from "../../services/canisters.services";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import type { Step, Steps } from "../../stores/steps.state";
  import { toastsStore } from "../../stores/toasts.store";
  import { mainTransactionFeeStore } from "../../stores/transaction-fees.store";
  import type { Account } from "../../types/account";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";
  import { valueSpan } from "../../utils/utils";
  import WizardModal from "../WizardModal.svelte";

  let icpToCyclesExchangeRate: bigint | undefined;
  onMount(async () => {
    icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate();
  });

  const steps: Steps = [
    {
      name: "SelectAccount",
      title: $i18n.accounts.select_source,
      showBackButton: true,
    },
    {
      name: "SelectCycles",
      title: $i18n.canisters.enter_amount,
      showBackButton: true,
    },
    {
      name: "ConfirmCycles",
      title: $i18n.canisters.review_create_canister,
      showBackButton: true,
    },
  ];

  let currentStep: Step | undefined;
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
      toastsStore.error({
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
      toastsStore.show({
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
      <SelectCyclesCanister
        {icpToCyclesExchangeRate}
        bind:amount
        on:nnsClose
        on:nnsBack={modal.back}
        on:nnsSelectAmount={selectAmount}
        minimumCycles={NEW_CANISTER_MIN_T_CYCLES}
      >
        <p>{$i18n.canisters.minimum_cycles_text_1}</p>
        <p>
          {@html replacePlaceholders($i18n.canisters.minimum_cycles_text_2, {
            $amount: valueSpan(
              formattedTransactionFeeICP($mainTransactionFeeStore)
            ),
          })}
        </p>
      </SelectCyclesCanister>
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
