<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import NewControllerReview from "$lib/components/canister-detail/NewControllerReview.svelte";
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Step, Steps } from "$lib/stores/steps.state";
  import LegacyWizardModal from "$lib/components/modals/LegacyWizardModal.svelte";

  const steps: Steps = [
    {
      name: "EnterController",
      title: $i18n.canister_detail.add_controller,
      showBackButton: false,
    },
    {
      name: "ConfirmController",
      title: $i18n.canister_detail.confirm_new_controller,
      showBackButton: true,
    },
  ];

  let currentStep: Step | undefined;
  let modal: LegacyWizardModal;
  let principal: Principal | undefined = undefined;

  const next = () => modal.next();
</script>

<LegacyWizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
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
</LegacyWizardModal>
