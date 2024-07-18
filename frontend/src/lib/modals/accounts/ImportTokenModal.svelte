<script lang="ts">
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { setContext } from "svelte";
  import {
    IMPORT_TOKEN_CONTEXT_KEY,
    type ImportTokenContext,
    type ImportTokenStore,
  } from "$lib/types/import-token.context";
  import { writable } from "svelte/store";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import { fetchIcrcToken } from "$lib/services/icrc-accounts.services";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { toastsError } from "$lib/stores/toasts.store";

  export let currentStep: WizardStep | undefined = undefined;

  const STEP_FORM = "Form";
  const STEP_REVIEW = "Review";
  const STEP_IN_PROGRESS = "InProgress";

  const steps: WizardSteps = [
    {
      name: STEP_FORM,
      title: $i18n.import_token.import_token,
    },
    {
      name: STEP_REVIEW,
      title: $i18n.import_token.review_token_info,
    },
    {
      name: STEP_IN_PROGRESS,
      title: $i18n.import_token.import_token,
    },
  ];

  let modal: WizardModal;
  const next = () => {
    modal?.next();
  };
  const back = () => {
    modal?.back();
  };

  let ledgerCanisterId: Principal | undefined;
  let indexCanisterId: Principal | undefined;
  let tokenMetaData: IcrcTokenMetadata | undefined;

  const updateTokenMetaData = async () => {
    if (isNullish(ledgerCanisterId)) {
      return;
    }
    const meta = await fetchIcrcToken({ ledgerCanisterId });

    if (meta === null) {
      tokenMetaData = undefined;
      toastsError({
        labelKey: "import_token.ledger_canister_loading_error",
      });
      return;
    }

    tokenMetaData = meta;
  };

  const onUserInput = async () => {
    // TODO: check the uniqueness of the ledgerCanisterId

    startBusy({ initiator: "import-token-validation" });
    await updateTokenMetaData();
    stopBusy("import-token-validation");

    console.log("tokenMetaData", tokenMetaData, modal);
    if (nonNullish(tokenMetaData)) {
      next();
    }
  };
</script>

<WizardModal
  testId="import-token-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
  disablePointerEvents={currentStep?.name === STEP_IN_PROGRESS}
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep?.name === STEP_FORM}
    <ImportTokenForm
      bind:ledgerCanisterId
      bind:indexCanisterId
      on:nnsClose
      on:nnsSubmit={onUserInput}
    />
  {/if}
  {#if currentStep?.name === STEP_REVIEW}
    TBD: ImportTokenReview
  {/if}
  {#if currentStep?.name === STEP_IN_PROGRESS}
    TBD: ImportTokenInProgress
  {/if}
</WizardModal>
