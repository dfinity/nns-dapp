<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import AttachCanister from "../../components/canisters/AttachCanister.svelte";
  import ConfirmCyclesCanister from "../../components/canisters/ConfirmCyclesCanister.svelte";
  import SelectCyclesCanister from "../../components/canisters/SelectCyclesCanister.svelte";
  import SelectNewCanisterType from "../../components/canisters/SelectNewCanisterType.svelte";
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
  import type { CreateOrLinkType } from "../../types/canisters";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";
  import WizardModal from "../WizardModal.svelte";

  let icpToCyclesExchangeRate: bigint | undefined;
  onMount(async () => {
    icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate();
  });

  const steps: Steps = [
    {
      name: "SelectNewCanisterType",
      title: $i18n.canisters.add_canister,
      showBackButton: false,
    },
  ];
  const attachCanisterSteps = [
    {
      name: "AttachCanister",
      title: $i18n.canisters.attach_canister,
      showBackButton: true,
    },
  ];
  const createCanisterSteps = [
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

  const selectType = async ({
    detail,
  }: CustomEvent<{ type: CreateOrLinkType }>) => {
    // We preserve the first step in the array because we want the current first step to *not* be re-rendered. It would cause a flickering of the content of the modal.
    steps.splice(1, steps.length);
    steps.push(
      ...(detail.type === "newCanisterAttach"
        ? attachCanisterSteps
        : createCanisterSteps)
    );
    // Wait steps to be applied - components to be updated - before being able to navigate to next step
    await tick();
    modal.next();
  };

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
    ><span data-tid="create-link-canister-modal-title"
      >{currentStep?.title ?? $i18n.canisters.add_canister}</span
    ></svelte:fragment
  >
  <svelte:fragment>
    {#if currentStep?.name === "SelectNewCanisterType"}
      <SelectNewCanisterType on:nnsSelect={selectType} />
    {/if}
    {#if currentStep?.name === "SelectAccount"}
      <SelectAccount
        hideHardwareWalletAccounts
        on:nnsSelectAccount={onSelectAccount}
      />
    {/if}
    {#if currentStep?.name === "AttachCanister"}
      <AttachCanister on:nnsClose />
    {/if}
    {#if currentStep?.name === "SelectCycles"}
      <SelectCyclesCanister
        {icpToCyclesExchangeRate}
        bind:amount
        on:nnsClose
        on:nnsSelectAmount={selectAmount}
        minimumCycles={NEW_CANISTER_MIN_T_CYCLES}
      >
        <p>{$i18n.canisters.minimum_cycles_text_1}</p>
        <p>
          {replacePlaceholders($i18n.canisters.minimum_cycles_text_2, {
            $amount: formattedTransactionFeeICP($mainTransactionFeeStore),
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
      />
    {/if}
  </svelte:fragment>
</WizardModal>
