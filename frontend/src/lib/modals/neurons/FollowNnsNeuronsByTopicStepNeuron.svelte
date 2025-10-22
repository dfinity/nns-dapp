<script lang="ts">
  import KnownNeuronFollowByTopicsItem from "$lib/components/neurons/KnownNeuronFollowByTopicsItem.svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { sortedknownNeuronsStore } from "$lib/stores/known-neurons.store";
  import {
    isHotKeyControllable,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import {
    getNnsTopicFollowings,
    isNnsNeuronFollowingAllTopics,
  } from "$lib/utils/nns-topics.utils";
  import { Html, Spinner, busy } from "@dfinity/gix-components";
  import {
    Topic,
    type FolloweesForTopic,
    type KnownNeuron,
    type NeuronInfo,
  } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
    topics: Topic[];
    isBusy?: boolean;
    errorMessage?: string;
    openPrevStep: () => void;
    addFolloweeByAddress: (followeeAddress: string) => Promise<void>;
    clearError: () => void;
  };

  let {
    neuron,
    topics,
    errorMessage = $bindable(),
    openPrevStep,
    addFolloweeByAddress,
    clearError,
  }: Props = $props();

  const followeesForTopics: FolloweesForTopic[] = $derived(
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
    await addFolloweeByAddress(followeeAddress);
  };

  const disabled: boolean = $derived(
    nonNullish(errorMessage) ||
      followeeAddress.length === 0 ||
      !isUserAuthorized ||
      $busy
  );

  const notFollowingKnownNeurons: KnownNeuron[] = $derived(
    $sortedknownNeuronsStore.filter(
      (knownNeuron) =>
        !isNnsNeuronFollowingAllTopics({
          followings: followeesForTopics,
          neuronId: knownNeuron.id,
          topics,
        })
    )
  );

  const handleFolloweeUpdated = () => {
    // Reset the form
    followeeAddress = "";
    clearError();
  };
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
    <div class="toolbar">
      <button
        class="secondary"
        type="button"
        data-tid="back-button"
        onclick={openPrevStep}
      >
        {$i18n.core.back}
      </button>
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

  <div class="following">
    <span class="label">{$i18n.new_followee.options_title}</span>
    {#if $sortedknownNeuronsStore === undefined}
      <Spinner />
    {:else}
      <ul>
        {#each notFollowingKnownNeurons as knownNeuron}
          <li data-tid="known-neuron-item">
            <KnownNeuronFollowByTopicsItem
              on:nnsUpdated={handleFolloweeUpdated}
              {knownNeuron}
              neuronId={neuron.neuronId}
              {topics}
            />
          </li>
        {/each}
      </ul>
    {/if}
  </div>
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

  .toolbar {
    display: flex;
    justify-content: space-between;
  }
</style>
