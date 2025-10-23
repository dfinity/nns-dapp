<script lang="ts">
  import KnownNeuronFollowByTopicsItem from "$lib/components/neurons/KnownNeuronFollowByTopicsItem.svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { sortedknownNeuronsStore } from "$lib/stores/known-neurons.store";
  import {
    isHotKeyControllable,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { getNnsTopicFollowings } from "$lib/utils/nns-topics.utils";
  import { Html, Spinner, busy } from "@dfinity/gix-components";
  import { Topic, type FolloweesForTopic, type NeuronInfo } from "@dfinity/nns";
  import { isNullish, nonNullish } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
    topics: Topic[];
    isBusy?: boolean;
    errorMessage?: string;
    openPrevStep: () => void;
    updateFollowings: (followeeAddress: string) => Promise<void>;
    clearError: () => void;
  };

  const {
    neuron,
    topics,
    errorMessage = $bindable(),
    openPrevStep,
    updateFollowings,
    clearError,
  }: Props = $props();

  const followings: FolloweesForTopic[] = $derived(
    getNnsTopicFollowings(neuron)
  );

  const isControllableByUser: boolean = $derived(
    isNeuronControllable({
      neuron,
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
    })
  );

  const isControllableByHotkey: boolean = $derived(
    isHotKeyControllable({
      neuron,
      identity: $authStore.identity,
    })
  );

  const isUserAuthorized: boolean = $derived.by(() => {
    const requiresController = topics.some(
      (currentTopic) => currentTopic === Topic.NeuronManagement
    );
    return requiresController
      ? isControllableByUser
      : isControllableByUser || isControllableByHotkey;
  });

  let followeeAddress = $state("");

  const handleSubmit = async () => {
    if (followeeAddress.length === 0) {
      return;
    }
    await updateFollowings(followeeAddress);
  };

  const disabled: boolean = $derived(
    nonNullish(errorMessage) ||
      followeeAddress.length === 0 ||
      !isUserAuthorized ||
      $busy
  );
</script>

<div data-tid="follow-nns-neurons-by-topic-step-neuron-component">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}
  >
    <InputWithError
      inputType="text"
      autocomplete="off"
      placeholderLabelKey="new_followee.placeholder"
      name="new-followee-address"
      bind:value={followeeAddress}
      errorMessage={nonNullish(errorMessage) ? "" : undefined}
      required
      on:nnsInput={clearError}
    >
      <svelte:fragment slot="label">{$i18n.new_followee.label}</svelte:fragment>
    </InputWithError>
    {#if nonNullish(errorMessage)}
      <p class="custom-error-message" data-tid="custom-error-message">
        <Html text={errorMessage} />
      </p>
    {/if}
    <div class="form-toolbar">
      <button
        data-tid="follow-neuron-button"
        class="primary"
        type="submit"
        {disabled}
      >
        {$i18n.new_followee.follow_neuron}
      </button>
    </div>
  </form>

  <Separator spacing="medium" />

  <div class="following">
    <h5 class="description">{$i18n.new_followee.known_neurons_title}</h5>
    {#if isNullish($sortedknownNeuronsStore)}
      <Spinner />
    {:else}
      <ul>
        {#each $sortedknownNeuronsStore as knownNeuron}
          <li data-tid="known-neuron-item">
            <KnownNeuronFollowByTopicsItem
              {knownNeuron}
              {followings}
              {topics}
              {updateFollowings}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <button
    class="secondary back-button"
    type="button"
    data-tid="back-button"
    onclick={openPrevStep}
  >
    {$i18n.core.back}
  </button>
</div>

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
  .form-toolbar {
    display: flex;
    justify-content: end;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    padding: var(--padding-1_5x) 0 0;

    li {
      &:first-child {
        border-top: none;
      }
    }
  }

  .back-button {
    margin-top: var(--padding-6x);
    width: 100%;
  }
</style>
