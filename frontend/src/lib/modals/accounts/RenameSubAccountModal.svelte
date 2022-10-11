<script lang="ts">
  import RenameSubAccountAction from "$lib/components/accounts/RenameSubAccountAction.svelte";
  import WizardModal from "$lib/modals/WizardModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Steps } from "$lib/stores/steps.state";
  import type { Step } from "$lib/stores/steps.state";

  let steps: Steps = [
    {
      name: "RenameSubAccount",
      title: $i18n.accounts.rename_linked_account,
      showBackButton: false,
    },
  ];

  let currentStep: Step | undefined;
</script>

<WizardModal {steps} bind:currentStep on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.accounts.rename_linked_account}</svelte:fragment
  >

  <RenameSubAccountAction on:nnsClose />
</WizardModal>
