<script lang="ts">
  import { onDestroy } from "svelte";

  import type { Unsubscriber } from "svelte/store";
  import Wizard from "../../components/ui/Wizard/Wizard.svelte";
  import WizardStep from "../../components/ui/Wizard/WizardStep.svelte";
  import { wizardStore } from "../../components/ui/Wizard/wizardStore";
  import { i18n } from "../../stores/i18n";
  import Modal from "../Modal.svelte";
  import AddNewAccount from "./AddNewAccount.svelte";
  import SelectTypeAccount from "./SelectTypeAccount.svelte";

  export let visible: boolean;
  let currentIndex: number = 0;
  const unsubscribeWizard: Unsubscriber = wizardStore.subscribe(
    (value) => (currentIndex = value)
  );

  const handleSelectType = () => {
    // TODO: Handle select "Attach Hardware Wallet"
    wizardStore.next();
  };

  const reset = () => {
    wizardStore.reset();
  };

  onDestroy(unsubscribeWizard);
</script>

<Modal
  {visible}
  theme="dark"
  size="medium"
  on:nnsClose
  showBackButton={currentIndex > 0}
  on:nnsBack={reset}
>
  <span slot="title">{$i18n.accounts.add_account}</span>
  <main>
    <Wizard>
      <WizardStep index={0}>
        <SelectTypeAccount on:nnsSelect={handleSelectType} />
      </WizardStep>
      <WizardStep index={1}>
        <AddNewAccount on:nnsClose />
      </WizardStep>
    </Wizard>
  </main>
</Modal>

<style lang="scss">
  main {
    height: 500px;
  }
</style>
