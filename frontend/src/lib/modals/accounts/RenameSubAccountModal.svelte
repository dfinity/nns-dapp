<script lang="ts">
  import RenameSubAccountAction from "$lib/components/accounts/RenameSubAccountAction.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  let steps: WizardSteps = [
    {
      name: "RenameSubAccount",
      title: $i18n.accounts.rename_linked_account,
    },
  ];

  let currentStep: WizardStep | undefined;

  const dispatcher = createEventDispatcher();
</script>

<WizardModal {steps} bind:currentStep onClose={() => dispatcher("nnsClose")}>
  {#snippet title()}{$i18n.accounts.rename_linked_account}{/snippet}

  <RenameSubAccountAction on:nnsClose />
</WizardModal>
