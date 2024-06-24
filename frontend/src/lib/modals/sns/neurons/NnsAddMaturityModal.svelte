<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { addMaturity } from "$lib/services/nns-neurons-dev.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { numberToE8s } from "$lib/utils/token.utils";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  const dispatcher = createEventDispatcher();

  let inputValue: number | undefined = undefined;
  let transferring = false;

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;

  const onSubmit = async () => {
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid maturity input.",
      });
      return;
    }

    startBusy({ initiator: "dev-add-nns-neuron-maturity" });

    await addMaturity({
      neuron,
      amountE8s: numberToE8s(inputValue),
    });

    dispatcher("nnsClose");
    stopBusy("dev-add-nns-neuron-maturity");
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<Modal testId="nns-add-maturity-modal-component" role="alert" on:nnsClose>
  <span slot="title">Add Nns Neuron Maturity</span>

  <form id="get-maturity-form" on:submit|preventDefault={onSubmit}>
    <span class="label">How much?</span>

    <Input
      placeholderLabelKey="core.amount"
      name="tokens"
      inputType="icp"
      bind:value={inputValue}
      disabled={transferring}
    />
  </form>

  <button
    data-tid="confirm-add-maturity-button"
    form="get-maturity-form"
    type="submit"
    class="primary"
    slot="footer"
    disabled={invalidForm || transferring}
  >
    {#if transferring}
      <Spinner />
    {:else}
      Add Maturity
    {/if}
  </button>
</Modal>
