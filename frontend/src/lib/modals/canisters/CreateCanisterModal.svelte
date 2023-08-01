<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import ConfirmCyclesCanister from "$lib/components/canisters/ConfirmCyclesCanister.svelte";
  import SelectCyclesCanister from "$lib/components/canisters/SelectCyclesCanister.svelte";
  import {
    MAX_CANISTER_NAME_LENGTH,
    NEW_CANISTER_MIN_T_CYCLES,
  } from "$lib/constants/canisters.constants";
  import {
    createCanister,
    getIcpToCyclesExchangeRate,
  } from "$lib/services/canisters.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsShow } from "$lib/stores/toasts.store";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";
  import type { Account } from "$lib/types/account";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formattedTransactionFeeICP } from "$lib/utils/token.utils";
  import { valueSpan } from "$lib/utils/utils";
  import {
    Html,
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import TextInputForm from "$lib/components/common/TextInputForm.svelte";
  import { ICPToken, nonNullish } from "@dfinity/utils";
  import { errorCanisterNameMessage } from "$lib/utils/canisters.utils";
  import TransactionFromAccount from "$lib/components/transaction/TransactionFromAccount.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";

  let icpToCyclesExchangeRate: bigint | undefined;
  onMount(async () => {
    icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate();
  });

  const steps: WizardSteps = [
    {
      name: "SelectData",
      title: $i18n.canisters.create_canister_title,
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
  let name = "";
  let amount: number | undefined;

  const onSelectAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    account = detail.selectedAccount;
    modal.next();
  };

  const goNext = () => {
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
      name,
    });
    stopBusy("create-canister");
    if (canisterId !== undefined) {
      if (nonNullish(name) && name.length > 0) {
        toastsShow({
          level: "success",
          labelKey: "canisters.create_canister_success_name",
          substitutions: {
            $canisterName: name,
          },
        });
      } else {
        toastsShow({
          level: "success",
          labelKey: "canisters.create_canister_success_id",
          substitutions: {
            $canisterId: canisterId.toText(),
          },
        });
      }
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
    {#if currentStep?.name === "SelectData"}
      <div class="from">
        <TransactionFromAccount
                bind:selectedAccount={account}
                canSelectSource={true}
                rootCanisterId={OWN_CANISTER_ID}
                token={ICPToken}
        />
      </div>

      <TextInputForm
        testId="create-canister-name-form"
        placeholderLabelKey="canisters.name"
        on:nnsConfirmText={goNext}
        on:nnsClose={modal.back}
        bind:text={name}
        disabledConfirm={nonNullish(name) &&
          name.length > MAX_CANISTER_NAME_LENGTH}
        errorMessage={errorCanisterNameMessage(name)}
        required={false}
      >
        <svelte:fragment slot="label"
          >{$i18n.canisters.enter_name_label}</svelte:fragment
        >
        <svelte:fragment slot="confirm-text">{$i18n.core.next}</svelte:fragment>
      </TextInputForm>
    {/if}
    {#if currentStep?.name === "SelectCycles"}
      <SelectCyclesCanister
        {icpToCyclesExchangeRate}
        bind:amount
        on:nnsClose
        on:nnsBack={modal.back}
        on:nnsSelectAmount={goNext}
        minimumCycles={NEW_CANISTER_MIN_T_CYCLES}
      >
        <svelte:fragment slot="select-amount"
          >{$i18n.canisters.review_create_canister}</svelte:fragment
        >
        <div>
          <p class="description">{$i18n.canisters.minimum_cycles_text_1}</p>
          <p class="description">
            <Html
              text={replacePlaceholders($i18n.canisters.minimum_cycles_text_2, {
                $amount: valueSpan(
                  formattedTransactionFeeICP($mainTransactionFeeStore)
                ),
              })}
            />
          </p>
        </div>
      </SelectCyclesCanister>
    {/if}
    {#if currentStep?.name === "ConfirmCycles" && amount !== undefined && account !== undefined}
      <ConfirmCyclesCanister
        {account}
        {icpToCyclesExchangeRate}
        {amount}
        {name}
        on:nnsConfirm={create}
        on:nnsClose
        on:nnsBack={modal.back}
      />
    {/if}
  </svelte:fragment>
</WizardModal>

<style lang="scss">
  .from {
    margin: 0 0 var(--padding-3x);
  }
</style>