<script lang="ts">
  import NewControllerReview from "$lib/components/canister-detail/NewControllerReview.svelte";
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";

  const steps: WizardSteps = [
    {
      name: "EnterController",
      title: $i18n.canister_detail.add_controller,
    },
    {
      name: "ConfirmController",
      title: $i18n.canister_detail.confirm_new_controller,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal<string>;
  let principal: Principal | undefined = undefined;

  const next = () => modal.next();

  const dispatcher = createEventDispatcher();
</script>

<WizardModal
  {steps}
  bind:currentStep
  bind:this={modal}
  onClose={() => dispatcher("nnsClose")}
>
  {#snippet title()}
    <span data-tid="add-controller-canister-modal-title">
      {currentStep?.title ?? $i18n.canister_detail.add_controller}
    </span>
  {/snippet}

  <svelte:fragment>
    {#if currentStep?.name === "EnterController"}
      <AddPrincipal bind:principal on:nnsSelectPrincipal={next} on:nnsClose>
        <span slot="title">{$i18n.canister_detail.enter_controller}</span>
        <span slot="button">{$i18n.core.continue}</span>
      </AddPrincipal>
    {/if}
    {#if currentStep?.name === "ConfirmController" && principal !== undefined}
      <NewControllerReview
        controller={principal}
        on:nnsClose
        on:nnsBack={modal.back}
      />
    {/if}
  </svelte:fragment>
</WizardModal>
