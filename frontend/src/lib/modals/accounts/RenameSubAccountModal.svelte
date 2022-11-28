<script lang="ts">
  import RenameSubAccountAction from "$lib/components/accounts/RenameSubAccountAction.svelte";
  import {
    WizardModal,
    type WizardSteps,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  let steps: WizardSteps = [
    {
      name: "RenameSubAccount",
      title: $i18n.accounts.rename_linked_account,
    },
  ];

  let currentStep: WizardStep | undefined;
</script>

<WizardModal {steps} bind:currentStep on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.accounts.rename_linked_account}</svelte:fragment
  >

  <RenameSubAccountAction on:nnsClose />
</WizardModal>
