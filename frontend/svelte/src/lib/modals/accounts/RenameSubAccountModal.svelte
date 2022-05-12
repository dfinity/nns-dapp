<script lang="ts">
  import RenameSubAccount from "../../components/accounts/RenameSubAccountAction.svelte";
  import WizardModal from "../WizardModal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Steps } from "../../stores/steps.state";
  import type { Account } from "../../types/account";
  import type { Step } from "../../stores/steps.state";

  export let selectedAccount: Account | undefined;

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
    <RenameSubAccount on:nnsClose {selectedAccount} />
  </svelte:fragment>
</WizardModal>
