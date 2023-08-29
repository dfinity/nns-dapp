<script lang="ts">
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";
  import { type SnsNeuronId } from "@dfinity/sns";
  import { addMaturity } from "$lib/api/sns-governance.api";
  import { getCurrentIdentity } from "$lib/services/auth.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import Input from "$lib/components/ui/Input.svelte";

  export let neuronId: SnsNeuronId;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  const dispatcher = createEventDispatcher();

  let inputValue: number | undefined = undefined;
  let transferring = false;

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;

  const onSubmit = async () => {
    console.log(1);
    console.log(2);
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid maturity input.",
      });
      return;
    }
    console.log(3);
    try {
      const identity = await getCurrentIdentity();
      startBusy({ initiator: "dev-add-sns-neuron-maturity" });
      await addMaturity({
        identity,
        rootCanisterId,
        neuronId,
        amountE8s: BigInt(Math.round(inputValue)),
      });
      await reloadNeuron();
      dispatcher("nnsClose");
    } catch (err) {
      console.error(err);
      toastsError({ labelKey: "error.adding_maturity", err });
    } finally {
      stopBusy("dev-add-sns-neuron-maturity");
    }
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<Modal role="alert" on:nnsClose>
  <span slot="title">{`Add Sns Neuron Maturity`}</span>

  <form
    id="get-icp-form"
    data-tid="get-icp-form"
    on:submit|preventDefault={onSubmit}
  >
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
    form="get-icp-form"
    data-tid="get-icp-submit"
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
