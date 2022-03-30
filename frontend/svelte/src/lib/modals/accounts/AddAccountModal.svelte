<script lang="ts">
  import AddNewAccount from "./AddNewAccount.svelte";
  import SelectTypeAccount from "./SelectTypeAccount.svelte";
  import WizardModal from "../WizardModal.svelte";
  import {i18n} from "../../stores/i18n";

  const steps: string[] = ["SelectAccount", "AddNewAccount"] as const;

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
    {#if currentStep === steps.indexOf("SelectAccount")}
      <SelectTypeAccount on:nnsSelect={handleSelectType} />
    {/if}
    {#if currentStep === steps.indexOf("AddNewAccount")}
      <AddNewAccount on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
