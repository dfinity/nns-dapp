<script lang="ts">
  import AddNewAccount from "../../components/accounts/AddNewAccount.svelte";
  import SelectTypeAccount from "../../components/accounts/SelectTypeAccount.svelte";
  import WizardModal from "../WizardModal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Steps } from "../../stores/steps.state";

  const steps: Steps = [
    {
      name: "SelectAccount",
      showBackButton: false,
    },
    { name: "AddNewAccount", showBackButton: true },
  ];

  let currentStepName: string | undefined;
  let modal: WizardModal;

  const handleSelectType = () => {
    // TODO: Handle select "Attach Hardware Wallet"
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStepName bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{$i18n.accounts.add_account}</svelte:fragment>

  <svelte:fragment>
    {#if currentStepName === "SelectAccount"}
      <SelectTypeAccount on:nnsSelect={handleSelectType} />
    {/if}
    {#if currentStepName === "AddNewAccount"}
      <AddNewAccount on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
