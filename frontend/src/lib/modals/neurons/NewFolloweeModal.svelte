<script lang="ts">
  import KnownNeuronFollowItem from "$lib/components/neurons/KnownNeuronFollowItem.svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { addFollowee } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { sortedknownNeuronsStore } from "$lib/stores/known-neurons.store";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { mapNeuronErrorToToastMessage } from "$lib/utils/error.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    followeesByTopic,
    isHotKeyControllable,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { Html, Modal, Spinner, busy } from "@dfinity/gix-components";
  import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import { createEventDispatcher, onMount } from "svelte";

  export let neuron: NeuronInfo;
  export let topic: Topic;

  let isControllableByUser: boolean;
  $: isControllableByUser = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });
  let isControllableByHotkey: boolean;
  $: isControllableByHotkey = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });
  let isUserAuthorized: boolean;
  $: isUserAuthorized =
    topic === Topic.NeuronManagement
      ? isControllableByUser
      : isControllableByUser || isControllableByHotkey;

  let followeeAddress = "";

  let topicFollowees: NeuronId[];
  $: topicFollowees = followeesByTopic({ neuron, topic }) ?? [];

  let errorMessage: string | undefined = undefined;
  let customErrorMessage: string | undefined = undefined;

  onMount(() => listKnownNeurons());

  const followsKnownNeuron = ({
    followees,
    knownNeuronId,
  }: {
    followees: NeuronId[];
    knownNeuronId: NeuronId;
  }): boolean => followees.find((id) => id === knownNeuronId) !== undefined;

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };
  const handleAddFolloweeError = ({
    followee,
    error,
  }: {
    followee: bigint;
    error: unknown;
  }) => {
    const toastMessage = mapNeuronErrorToToastMessage(error);
    const errorDetail = toastMessage.detail ?? "";
    if (/\d+: Followee \(\d+\) does not exist\./.test(errorDetail)) {
      // ref. https://github.com/dfinity/ic/blob/e06dd63694ceed999499c14271617c03633da758/rs/nns/governance/src/governance.rs#L3378
      errorMessage = replacePlaceholders(
        $i18n.new_followee.followee_does_not_exist,
        {
          $neuronId: followee.toString(),
        }
      );
    } else if (
      /you must be the controller or a hotkey of it/.test(errorDetail)
    ) {
      // ref. https://github.com/dfinity/ic/blob/e06dd63694ceed999499c14271617c03633da758/rs/nns/governance/src/governance.rs#L3370
      customErrorMessage = replacePlaceholders(
        $i18n.new_followee.followee_not_permit,
        {
          $neuronId: followee.toString(),
          $principalId: $authStore.identity?.getPrincipal().toText() ?? "",
        }
      );
      errorMessage = ""; // To display the error state of InputWithError
    } else {
      toastsShow(toastMessage);
    }
  };
  const addFolloweeByAddress = async () => {
    clearError();

    let followee: bigint;
    if (followeeAddress.length === 0) {
      return;
    }

    try {
      followee = BigInt(followeeAddress);
    } catch (_) {
      errorMessage = $i18n.new_followee.followee_incorrect_id_format;
      return;
    }

    if (BigInt(followeeAddress) === neuron.neuronId) {
      errorMessage = $i18n.new_followee.followee_no_self_following;
      return;
    }

    startBusy({ initiator: "add-followee" });

    let addFolloweeError = true;
    try {
      await addFollowee({
        neuronId: neuron.neuronId,
        topic,
        followee,
      });
      addFolloweeError = false;
    } catch (err) {
      handleAddFolloweeError({ followee, error: err });
    }

    stopBusy("add-followee");

    if (!addFolloweeError) {
      close();
      followeeAddress = "";
    }
  };

  const clearError = () => {
    errorMessage = undefined;
    customErrorMessage = undefined;
  };
  let disabled: boolean;
  $: disabled =
    errorMessage !== undefined ||
    followeeAddress.length === 0 ||
    !isUserAuthorized ||
    $busy;
</script>

<Modal onClose={close} testId="new-followee-modal-component">
  {#snippet title()}{$i18n.new_followee.title}{/snippet}

  <form on:submit|preventDefault={addFolloweeByAddress}>
    <InputWithError
      inputType="text"
      autocomplete="off"
      placeholderLabelKey="new_followee.placeholder"
      name="new-followee-address"
      bind:value={followeeAddress}
      {errorMessage}
      required
      on:nnsInput={clearError}
    >
      <svelte:fragment slot="label">{$i18n.new_followee.label}</svelte:fragment>
    </InputWithError>
    {#if nonNullish(customErrorMessage)}
      <p class="custom-error-message">
        <Html text={customErrorMessage} />
      </p>
    {/if}
    <button
      data-tid="follow-neuron-button"
      class="primary"
      type="submit"
      {disabled}
    >
      {$i18n.new_followee.follow_neuron}
    </button>
  </form>

  <div class="following">
    <span class="label">{$i18n.new_followee.options_title}</span>
    {#if $sortedknownNeuronsStore === undefined}
      <Spinner />
    {:else}
      <ul>
        {#each $sortedknownNeuronsStore as knownNeuron}
          <li data-tid="known-neuron-item">
            <KnownNeuronFollowItem
              on:nnsUpdated={close}
              {knownNeuron}
              neuronId={neuron.neuronId}
              {topic}
              isFollowed={followsKnownNeuron({
                followees: topicFollowees,
                knownNeuronId: knownNeuron.id,
              })}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</Modal>

<style lang="scss">
  form {
    gap: var(--padding-2x);

    .custom-error-message {
      // mock InputWithError error message style
      margin-top: calc(-1 * var(--padding));
      color: var(--negative-emphasis);
      font-size: var(--font-size-ultra-small);
      line-height: var(--line-height-1_25x);
    }
  }

  button {
    width: fit-content;
    align-self: flex-end;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    padding: var(--padding-1_5x) 0 0;
  }

  .following {
    margin: var(--padding-4x) 0 0;
  }
</style>
