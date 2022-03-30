<script lang="ts">
  import Transition from "../../components/ui/Transition.svelte";
  import { StepsState } from "../../services/stepsState.services";
  import { i18n } from "../../stores/i18n";
  import Modal from "../Modal.svelte";
  import AddNewAccount from "../../components/accounts/AddNewAccount.svelte";
  import SelectTypeAccount from "../../components/accounts/SelectTypeAccount.svelte";

  enum Steps {
    SelectAccount,
    AddNewAccount,
  }
  let stepState = new StepsState<typeof Steps>(Steps);

  let currentStep: Steps;
  let diff: number;
  $: ({ currentStep, diff } = stepState);

  const handleSelectType = () => {
    // TODO: Handle select "Attach Hardware Wallet"
    stepState = stepState.next();
  };
  const goBack = () => {
    stepState = stepState.back();
  };
</script>

<Modal
  theme="dark"
  size="medium"
  on:nnsClose
  showBackButton={currentStep > 0}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.accounts.add_account}</span>
  <article>
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
  </article>
</Modal>

<style lang="scss">
  // TODO: Manage modal height in L2-302
  article {
    height: 500px;
    padding: 0;
    margin: 0;
  }
</style>
