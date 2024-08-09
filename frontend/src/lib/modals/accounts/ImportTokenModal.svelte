<script lang="ts">
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import ImportTokenForm from "$lib/components/accounts/ImportTokenForm.svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { nonNullish } from "@dfinity/utils";
  let currentStep: WizardStep | undefined = undefined;
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
  let ledgerCanisterId: Principal | undefined;
  let indexCanisterId: Principal | undefined;
  let tokenMetaData: IcrcTokenMetadata | undefined;
  const onUserInput = async () => {
    // TODO: load metadata and validation
    next();
  };
</script>

<WizardModal
  testId="import-token-modal-component"
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
    TBD: Review imported token
  {/if}
</WizardModal>
