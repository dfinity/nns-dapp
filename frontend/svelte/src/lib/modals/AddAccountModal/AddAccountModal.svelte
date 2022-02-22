<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { StepsState } from "../../services/stepsState.services";
  import { i18n } from "../../stores/i18n";
  import SelectAccount from "../CreateNeuronModal/SelectAccount.svelte";
  import Modal from "../Modal.svelte";
  import AddNewAccount from "./AddNewAccount.svelte";
  import SelectTypeAccount from "./SelectTypeAccount.svelte";

  export let visible: boolean;
  enum Steps {
    SelectAccount,
    AddNewAccount,
  }
  let stepState = new StepsState<typeof Steps>(Steps);

  let currentStep: Steps;
  $: currentStep = stepState.currentStep;
  let diff: number;
  $: diff = stepState.diff;

  const handleSelectType = () => {
    // TODO: Handle select "Attach Hardware Wallet"
    stepState = stepState.next();
  };
</script>

<Modal
  {visible}
  theme="dark"
  size="medium"
  on:nnsClose
  showBackButton={currentStep > 0}
>
  <span slot="title">{$i18n.accounts.add_account}</span>
  <main>
    {#if currentStep === Steps.SelectAccount}
      <SelectTypeAccount on:nnsSelect={handleSelectType} />
    {/if}
    {#if currentStep === Steps.AddNewAccount}
      <AddNewAccount on:nnsClose />
    {/if}
  </main>
</Modal>

<style lang="scss">
  main {
    height: 500px;
  }
</style>
