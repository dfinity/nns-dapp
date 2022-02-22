<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import Transition from "../../components/ui/Transition.svelte";
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
  const goBack = () => {
    stepState = stepState.back();
  };
</script>

<Modal
  {visible}
  theme="dark"
  size="medium"
  on:nnsClose
  showBackButton={currentStep > 0}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.accounts.add_account}</span>
  <section>
    {#if currentStep === Steps.SelectAccount}
      <Transition {diff}>
        <SelectTypeAccount on:nnsSelect={handleSelectType} />
      </Transition>
    {/if}
    {#if currentStep === Steps.AddNewAccount}
      <Transition {diff}>
        <AddNewAccount on:nnsClose />
      </Transition>
    {/if}
  </section>
</Modal>

<style lang="scss">
  section {
    height: 500px;
    padding: 0;
    margin: 0;
  }
</style>
