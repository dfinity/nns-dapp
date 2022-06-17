<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import NewControllerReview from "../../components/canister-detail/NewControllerReview.svelte";
  import AddPrincipal from "../../components/common/AddPrincipal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";

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
      <AddPrincipal bind:principal on:nnsSelectPrincipal={next}>
        <span slot="title">{$i18n.canister_detail.enter_controller}</span>
        <span slot="button">{$i18n.core.continue}</span>
      </AddPrincipal>
    {/if}
    {#if currentStep?.name === "ConfirmController" && principal !== undefined}
      <NewControllerReview controller={principal} on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
