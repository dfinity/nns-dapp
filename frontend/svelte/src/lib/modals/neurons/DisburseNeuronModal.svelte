<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { type NeuronInfo, ICP } from "@dfinity/nns";
  import WizardModal from "../WizardModal.svelte";
  import type { Step, Steps } from "../../stores/steps.state";
  import { createEventDispatcher } from "svelte";
  import type { Account } from "../../types/account";
  import Address from "../../components/accounts/Address.svelte";
  import SelectAccount from "../../components/accounts/SelectAccount.svelte";
  import { emptyAddress } from "../../utils/accounts.utils";
  import { neuronStake } from "../../utils/neuron.utils";
  import IcpComponent from "../../components/ic/ICP.svelte";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";

  export let neuron: NeuronInfo;

  const steps: Steps = [
    {
      name: "SelectDestination",
      showBackButton: false,
      title: $i18n.neuron_detail.disburse_neuron_title,
    },
    {
      name: "ConfirmDisburse",
      showBackButton: true,
      title: $i18n.accounts.review_transaction,
    },
  ];

  let currentStep: Step;
  let modal: WizardModal;
  let address: string;

  let destinationAddress: string | undefined;

  const onEnterAddress = () => {
    destinationAddress = address;
    goNext();
  };

  const onSelectAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    destinationAddress = detail.selectedAccount.identifier;
    goNext();
  };

  const goNext = () => {
    modal.next();
  };

  const dispatcher = createEventDispatcher();
  const executeTransaction = () => {
    // TODO: https://dfinity.atlassian.net/browse/L2-432
    dispatcher("nnsClose");
  };
</script>

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>
  {#if currentStep.name === "SelectDestination"}
    <Address bind:address on:submit={onEnterAddress} />
    <SelectAccount
      on:nnsSelectAccount={onSelectAccount}
      disableSelection={!emptyAddress(address)}
    />
  {/if}
  {#if currentStep.name === "ConfirmDisburse"}
    <form on:submit|preventDefault={executeTransaction} class="wizard-wrapper">
      <div class="amount">
        <IcpComponent inline={true} icp={ICP.fromE8s(neuronStake(neuron))} />
      </div>

      <h5>{$i18n.accounts.source}</h5>
      <p>{neuron.neuronId}</p>

      <h5>{$i18n.accounts.destination}</h5>
      <p>{destinationAddress}</p>

      <h5>{$i18n.accounts.transaction_fee}</h5>

      <p class="fee">{formattedTransactionFeeICP()} {$i18n.core.icp}</p>

      <button class="primary full-width" type="submit">
        {$i18n.accounts.confirm_and_send}
      </button>
    </form>
  {/if}
</WizardModal>

<style lang="scss">
  @use "../../themes/mixins/modal";

  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    flex-grow: 1;

    --icp-font-size: var(--font-size-huge);

    @include modal.header;
  }

  button {
    margin: var(--padding) 0 0;
  }

  h5 {
    margin: 0;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    word-wrap: break-word;
  }

  .fee {
    flex-grow: 1;
  }
</style>
