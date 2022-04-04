<script lang="ts">
  import AddNewAccount from "../../components/accounts/AddNewAccount.svelte";
  import SelectTypeAccount from "../../components/accounts/SelectTypeAccount.svelte";
  import WizardModal from "../WizardModal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Steps } from "../../stores/steps.state";
  import type { Step } from "../../stores/steps.state";

  const steps: Steps = [
    {
      name: "SelectAccount",
      title: $i18n.accounts.add_account,
      showBackButton: false,
    },
    {
      name: "AddNewAccount",
      title: $i18n.accounts.add_account,
      showBackButton: true,
    },
  ];

  let currentStep: Step | undefined;
  let modal: WizardModal;

  const handleSelectType = () => {
    // TODO: Handle select "Attach Hardware Wallet"
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{currentStep?.title ?? $i18n.accounts.add_account}</svelte:fragment>

  <svelte:fragment>
    {#if currentStep?.name === "SelectAccount"}
      <SelectTypeAccount on:nnsSelect={handleSelectType} />
    {/if}
    {#if currentStep?.name === "AddNewAccount"}
      <AddNewAccount on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
