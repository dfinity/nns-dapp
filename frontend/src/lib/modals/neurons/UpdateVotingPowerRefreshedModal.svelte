<script lang="ts">
  import Input from "$lib/components/ui/Input.svelte";
  import { updateVotingPowerRefreshedTimestamp } from "$lib/services/nns-neurons-dev.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { secondsToDateTime } from "$lib/utils/date.utils";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  const YEAR_2099_SECONDS = new Date(2099, 0, 0).getTime() / 1000;

  const toBigInt = (value: number | undefined): bigint | undefined => {
    try {
      if (value !== undefined) return BigInt(value);
    } catch (_) {
      // Do nothing
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

  const onDateTimeChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      const localDate = new Date(value);
      secondsValue = Math.floor(localDate.getTime() / 1000);
    }
  };

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
<Modal
  role="alert"
  on:nnsClose
  testId="update-voting-power-refreshed-modal-component"
>
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
        testId="update-voting-power-refreshed-seconds-input"
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
    data-tid="confirm-update-voting-power-refreshed-button"
    form="dev-update-voting-power-refreshed"
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
