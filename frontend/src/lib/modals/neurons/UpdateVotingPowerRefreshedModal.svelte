<script lang="ts">
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { updateVotingPowerRefreshedTimestamp } from "$lib/services/nns-neurons-dev.services";
  import { isNullish } from "@dfinity/utils";
  import Input from "$lib/components/ui/Input.svelte";
  import { secondsToDateTime } from "../../utils/date.utils";

  const YEAR_2099_SECONDS = 4070908800;

  const toBigInt = (value: number | undefined): bigint | undefined => {
    try {
      if (value !== undefined) return BigInt(value);
    } finally {
    }
    return undefined;
  };

  export let neuron: NeuronInfo;

  const dispatcher = createEventDispatcher();

  let votingPowerRefreshedTimestampSeconds: bigint;
  $: votingPowerRefreshedTimestampSeconds =
    // the value should always be defined
    neuron.fullNeuron?.votingPowerRefreshedTimestampSeconds ?? 0n;

  let secondsValue: number;
  $: secondsValue = Number(votingPowerRefreshedTimestampSeconds);

  // Will be initially set by the inputs sync.
  let dateTimeValue: string = "";

  $: if (secondsValue >= 0) {
    if (secondsValue > YEAR_2099_SECONDS) {
      secondsValue = YEAR_2099_SECONDS;
    }
    const utcDate = new Date(secondsValue * 1000);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );
    dateTimeValue = localDate.toISOString().slice(0, 16);
  }

  function onDateTimeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      const localDate = new Date(value);
      secondsValue = Math.floor(localDate.getTime() / 1000);
    }
  }

  let updating = false;

  const onSubmit = async () => {
    const seconds = toBigInt(secondsValue);
    if (isNullish(seconds)) {
      toastsError({
        labelKey: "Invalid input.",
      });
      return;
    }

    updating = true;
    startBusy({ initiator: "dev-update-voting-power-refreshed" });

    try {
      await updateVotingPowerRefreshedTimestamp({
        neuron,
        seconds,
      });
    } finally {
      updating = false;
      stopBusy("dev-update-voting-power-refreshed");
      dispatcher("nnsClose");
    }
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<Modal role="alert" on:nnsClose>
  <span slot="title">Voting Power Refreshed Timestamp</span>

  <form
    class="form"
    id="dev-update-voting-power-refreshed"
    on:submit|preventDefault={onSubmit}
  >
    <div>
      <p>
        Current timestamp: {secondsToDateTime(
          votingPowerRefreshedTimestampSeconds
        )}
      </p>
      <p>
        New timestamp:
        <input
          bind:value={dateTimeValue}
          on:input={onDateTimeChange}
          disabled={updating}
          id="date-value"
          type="datetime-local"
          name="date-value"
        />
      </p>
    </div>
    <div>
      <span class="label">Value in seconds</span>

      <Input
        placeholderLabelKey="core.amount"
        name="seconds"
        inputType="number"
        step={1}
        bind:value={secondsValue}
        disabled={updating}
      />
    </div>
  </form>

  <button
    data-tid="confirm-add-maturity-button"
    form="get-maturity-form"
    class="primary"
    slot="footer"
    disabled={isNullish(toBigInt(secondsValue)) || updating}
    on:click={onSubmit}
  >
    {#if updating}
      <Spinner />
    {:else}
      Update
    {/if}
  </button>
</Modal>

<style lang="scss">
  input {
    all: unset;
    padding: var(--padding);
    border-radius: var(--border-radius);
    border: 1px solid var(--elements-divider);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }
</style>
