<script lang="ts">
  import { tick } from "svelte";
  import AttachCanister from "../../components/canisters/AttachCanister.svelte";
  import ConfirmCyclesCanister from "../../components/canisters/ConfirmCyclesCanister.svelte";
  import SelectCyclesCanister from "../../components/canisters/SelectCyclesCanister.svelte";
  import SelectNewCanisterType from "../../components/canisters/SelectNewCanisterType.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Step, Steps } from "../../stores/steps.state";
  import type { CreateOrLinkType } from "../../types/canisters";
  import WizardModal from "../WizardModal.svelte";

  const steps: Steps = [
    {
      name: "SelectNewCanisterType",
      title: $i18n.canisters.add_canister,
      showBackButton: false,
    },
  ];
  const attachCanisterSteps = [
    {
      name: "AttachCanister",
      title: $i18n.canisters.attach_canister,
      showBackButton: true,
    },
  ];
  const createCanisterSteps = [
    {
      name: "SelectCycles",
      title: $i18n.canisters.enter_amount,
      showBackButton: true,
    },
    {
      name: "ConfirmCycles",
      title: $i18n.canisters.review_create_canister,
      showBackButton: true,
    },
  ];

  let currentStep: Step | undefined;
  let modal: WizardModal;
  let amount: number | undefined;

  const selectType = async ({
    detail,
  }: CustomEvent<{ type: CreateOrLinkType }>) => {
    // We preserve the first step in the array because we want the current first step to *not* be re-rendered. It would cause a flickering of the content of the modal.
    steps.splice(1, steps.length);
    steps.push(
      ...(detail.type === "newCanisterAttach"
        ? attachCanisterSteps
        : createCanisterSteps)
    );
    // Wait steps to be applied - components to be updated - before being able to navigate to next step
    await tick();
    modal.next();
  };

  const selectAmount = () => {
    modal.next();
  };

  // TODO: Finish flow - https://dfinity.atlassian.net/browse/L2-227
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
    {#if currentStep?.name === "SelectCycles"}
      <SelectCyclesCanister
        bind:amount
        on:nnsClose
        on:nnsSelectAmount={selectAmount}
      />
    {/if}
    {#if currentStep?.name === "ConfirmCycles"}
      <ConfirmCyclesCanister on:nnsClose />
    {/if}
  </svelte:fragment>
</WizardModal>
