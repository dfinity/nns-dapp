<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import NewControllerReview from "$lib/components/canister-detail/NewControllerReview.svelte";
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";

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
  let modal: WizardModal;
  let principal: Principal | undefined = undefined;

  const next = () => modal.next();
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="add-controller-canister-modal-title"
      >{currentStep?.title ?? $i18n.canister_detail.add_controller}</span
    ></svelte:fragment
  >
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
