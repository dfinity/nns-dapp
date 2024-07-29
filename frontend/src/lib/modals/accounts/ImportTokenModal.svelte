<script lang="ts">
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import { fetchIcrcToken } from "$lib/services/icrc-accounts.services";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import ImportTokenReview from "$lib/components/accounts/ImportTokenReview.svelte";
  import { addImportedToken } from "$lib/services/imported-tokens.services";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";

  export let currentStep: WizardStep | undefined = undefined;

  const STEP_FORM = "Form";
  const STEP_REVIEW = "Review";

  const steps: WizardSteps = [
    {
      name: STEP_FORM,
      title: $i18n.import_token.import_token,
    },
    {
      name: STEP_REVIEW,
      title: $i18n.import_token.review_token_info,
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
    startBusy({
      initiator: "import-token-validation",
      labelKey: "import_token.verifying",
    });
    await updateTokenMetaData();
    // TODO: validate index canister id here (if provided)

    stopBusy("import-token-validation");

    if (nonNullish(tokenMetaData)) {
      next();
    }
  };

  const onUserConfirm = async () => {
    if (isNullish(ledgerCanisterId) || isNullish($importedTokensStore.importedTokens)) {
      return;
    }

    startBusy({
      initiator: "import-token-importing",
      labelKey: "import_token.importing",
    });

    await addImportedToken({
      tokenToAdd: {
        ledgerCanisterId,
        indexCanisterId,
      },
      importedTokens: $importedTokensStore.importedTokens,
    });

    stopBusy("import-token-importing");

    // TODO: navigate to imported token details page
  };
</script>

<WizardModal
  testId="import-token-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose
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
  {#if currentStep?.name === STEP_REVIEW && nonNullish(ledgerCanisterId) && nonNullish(tokenMetaData)}
    <ImportTokenReview
      {ledgerCanisterId}
      {indexCanisterId}
      {tokenMetaData}
      on:nnsBack={back}
      on:nnsConfirm={onUserConfirm}
    />
  {/if}
</WizardModal>
