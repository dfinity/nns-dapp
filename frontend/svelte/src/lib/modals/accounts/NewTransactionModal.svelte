<script lang="ts">
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import SelectDestination from "../../components/accounts/SelectDestination.svelte";

  export let canSelectAccount: boolean;

  const steps: Steps = [
    ...(canSelectAccount
      ? [
          {
            name: "SelectAccount",
            showBackButton: false,
            title: $i18n.accounts.select_source,
          },
        ]
      : []) as Steps,
    {
      name: "SelectDestination",
      showBackButton: canSelectAccount,
      title: $i18n.accounts.select_destination,
    },
  ];

  let selectedAccount: Account | undefined;

  const chooseAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    selectedAccount = detail.selectedAccount;
    modal.next();
  };

  let currentStep: Step | undefined;
  let modal: WizardModal;
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    >{currentStep?.title ?? $i18n.accounts.add_account}</svelte:fragment
  >

  <svelte:fragment>
    {#if currentStep?.name === "SelectAccount"}
      <SelectAccount on:nnsSelectAccount={chooseAccount} />
    {/if}
    {#if currentStep?.name === "SelectDestination"}
      <SelectDestination />
    {/if}
  </svelte:fragment>
</WizardModal>
