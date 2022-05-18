<script lang="ts">
  import RenameSubAccountAction from "../../components/accounts/RenameSubAccountAction.svelte";
  import WizardModal from "../WizardModal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Steps } from "../../stores/steps.state";
  import type { Step } from "../../stores/steps.state";

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

  <svelte:fragment>
    <RenameSubAccountAction on:nnsClose />
  </svelte:fragment>
</WizardModal>
