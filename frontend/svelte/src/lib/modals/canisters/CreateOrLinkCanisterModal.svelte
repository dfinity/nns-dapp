<script lang="ts">
  import AttachCanister from "../../components/canisters/AttachCanister.svelte";
  import SelectNewCanisterType from "../../components/canisters/SelectNewCanisterType.svelte";

  import { i18n } from "../../stores/i18n";
  import type { Step, Steps } from "../../stores/steps.state";
  import WizardModal from "../WizardModal.svelte";

  // TODO: Create Canister Flow https://dfinity.atlassian.net/browse/L2-227
  const steps: Steps = [
    {
      name: "SelectNewCanisterType",
      title: $i18n.canisters.add_canister,
      showBackButton: false,
    },
    {
      name: "AttachCanister",
      title: $i18n.canisters.attach_canister,
      showBackButton: false,
    },
  ];

  let currentStep: Step | undefined;
  let modal: WizardModal;

  // TODO: Create Canister Flow https://dfinity.atlassian.net/browse/L2-227
  const selectType = () => {
    modal.next();
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="create-link-canister-modal-title"
      >{currentStep?.title ?? $i18n.accounts.add_account}</span
    ></svelte:fragment
  >
  <svelte:fragment>
    {#if currentStep?.name === "SelectNewCanisterType"}
      <SelectNewCanisterType on:nnsSelect={selectType} />
    {/if}
    {#if currentStep?.name === "AttachCanister"}
      <AttachCanister on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
