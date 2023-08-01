<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import ConfirmCyclesCanister from "$lib/components/canisters/ConfirmCyclesCanister.svelte";
  import SelectCyclesCanister from "$lib/components/canisters/SelectCyclesCanister.svelte";
  import {
    getIcpToCyclesExchangeRate,
    topUpCanister,
  } from "$lib/services/canisters.services";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import {
    WizardModal,
    Html,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "$lib/types/canister-detail.context";
  import CanisterIdInfo from "$lib/components/canisters/CanisterIdInfo.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formattedTransactionFeeICP } from "$lib/utils/token.utils";
  import { mainTransactionFeeStore } from "$lib/stores/transaction-fees.store";
  import { valueSpan } from "$lib/utils/utils";
  import { ICPToken } from "@dfinity/utils";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import TransactionFromAccount from "$lib/components/transaction/TransactionFromAccount.svelte";

  let icpToCyclesExchangeRate: bigint | undefined;
  onMount(async () => {
    icpToCyclesExchangeRate = await getIcpToCyclesExchangeRate();
  });

  const steps: WizardSteps = [
    {
      name: "SelectCycles",
      title: $i18n.canister_detail.top_up_canister,
    },
    {
      name: "ConfirmCycles",
      title: $i18n.canisters.review_cycles_purchase,
    },
  ];

  const { store, reloadDetails }: CanisterDetailsContext =
    getContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY);

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;
  let account: Account | undefined;
  let amount: number | undefined;
  let canisterId: Principal | undefined;
  $: canisterId = $store.info?.canister_id;
  let canisterName: string | undefined;
  $: canisterName = $store.info?.name;

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
      toastsError({
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
      account,
    });
    if (success) {
      await reloadDetails(canisterId);
    }
    stopBusy("top-up-canister");
    if (success) {
      toastsSuccess({
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
    {#if currentStep?.name === "SelectCycles"}
      <div class="from">
        <TransactionFromAccount
          bind:selectedAccount={account}
          canSelectSource={true}
          rootCanisterId={OWN_CANISTER_ID}
          token={ICPToken}
        />
      </div>
      <SelectCyclesCanister
        {icpToCyclesExchangeRate}
        bind:amount
        on:nnsClose
        on:nnsBack={() => modal.back()}
        on:nnsSelectAmount={selectAmount}
        backAction={false}
      >
        <svelte:fragment slot="select-amount"
          >{$i18n.canisters.review_cycles_purchase}</svelte:fragment
        >
        <p class="description">
          <Html
            text={replacePlaceholders($i18n.canisters.transaction_fee, {
              $amount: valueSpan(
                formattedTransactionFeeICP($mainTransactionFeeStore)
              ),
            })}
          />
        </p>
      </SelectCyclesCanister>
    {/if}
    {#if currentStep?.name === "ConfirmCycles" && amount !== undefined && account !== undefined}
      <ConfirmCyclesCanister
        {account}
        {icpToCyclesExchangeRate}
        {amount}
        name={canisterName}
        on:nnsClose
        on:nnsBack={modal.back}
        on:nnsConfirm={addCycles}
      >
        <CanisterIdInfo {canisterId} />
      </ConfirmCyclesCanister>
    {/if}
  </svelte:fragment>
</WizardModal>

<style lang="scss">
  .from {
    margin: 0 0 var(--padding-3x);
  }
</style>
