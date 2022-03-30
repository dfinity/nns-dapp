<script lang="ts">
  import AddNewAccount from "../../components/accounts/AddNewAccount.svelte";
  import SelectTypeAccount from "../../components/accounts/SelectTypeAccount.svelte";
  import WizardModal from "../WizardModal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Step } from "../../stores/steps.state";
  import { stepIndex } from "../../utils/step.utils";

  const steps: Step[] = [
    {
      name: "SelectAccount",
      showBackButton: false,
    },
    { name: "AddNewAccount", showBackButton: true },
  ] as const;

  let currentStep: number;
  let modal: WizardModal;

  const handleSelectType = () => {
    // TODO: Handle select "Attach Hardware Wallet"
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{$i18n.accounts.add_account}</svelte:fragment>

  <svelte:fragment>
    {#if currentStep === stepIndex({ name: "SelectAccount", steps })}
      <SelectTypeAccount on:nnsSelect={handleSelectType} />
    {/if}
    {#if currentStep === stepIndex({ name: "AddNewAccount", steps })}
      <AddNewAccount on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
