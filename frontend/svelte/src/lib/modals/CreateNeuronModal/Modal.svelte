<script lang="ts">
  import Wizard from "../../components/ui/Wizard/Wizard.svelte";
  import WizardStep from "../../components/ui/Wizard/WizardStep.svelte";
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { accountsStore } from "../../stores/accounts.store";
  import { onDestroy, onMount } from "svelte";
  import SelectAccount from "./SelectAccount.svelte";
  import StakeNeuron from "./StakeNeuron.svelte";

  export let visible: boolean;

  let main: Account | undefined;
  const unsubscribe = accountsStore.subscribe((accountStore) => {
    main = accountStore?.main;
  });

  let wizard: Wizard | undefined;
  let currentIndex: number | undefined;
  const chooseAccount = () => {
    wizard?.next();
  };
  const goBack = () => {
    wizard?.back();
  };

  onMount(() => {
    wizard?.subscribe((value) => (currentIndex = value));
  });

  onDestroy(unsubscribe);
</script>

<Modal
  {visible}
  on:nnsClose
  theme="dark"
  size="medium"
  showBackButton={currentIndex === 1}
  on:nnsBack={goBack}
>
  <span slot="title">{$i18n.neurons.select_source}</span>
  <main>
    <Wizard bind:this={wizard}>
      <WizardStep index={0}>
        <SelectAccount {main} on:nnsSelectAccount={chooseAccount} />
      </WizardStep>
      <WizardStep index={1}>
        {#if main}
          <StakeNeuron account={main} />
        {/if}
      </WizardStep>
    </Wizard>
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));
  }
</style>
