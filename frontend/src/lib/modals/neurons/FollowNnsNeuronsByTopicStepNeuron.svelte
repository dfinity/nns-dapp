<script lang="ts">
  import KnownNeuronFollowByTopicsItem from "$lib/components/neurons/KnownNeuronFollowByTopicsItem.svelte";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { setFollowing } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { sortedknownNeuronsStore } from "$lib/stores/known-neurons.store";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { mapNeuronErrorToToastMessage } from "$lib/utils/error.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
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
    selectedTopics: Topic[];
    isBusy?: boolean;
    openPrevStep: () => void;
  };

  let {
    neuron,
    topics,
    selectedTopics = $bindable(),
    openPrevStep,
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
  let errorMessage: string | undefined = $state();

  const clearError = () => {
    errorMessage = undefined;
  };

  const handleUpdateFollowingError = ({
    followee,
    error,
  }: {
    followee: bigint;
    error: unknown;
  }) => {
    const toastMessage = mapNeuronErrorToToastMessage(error);
    const errorDetail = toastMessage.detail ?? "";
    // ref. https://github.com/dfinity/ic/blob/13a56ce65d36b85d10ee5e3171607cc2c31cf23e/rs/nns/governance/src/governance.rs#L8421
    const NON_EXISTENT_NEURON_ERROR =
      /: The neuron with ID \d+ does not exist\./;
    // ref. https://github.com/dfinity/ic/blob/13a56ce65d36b85d10ee5e3171607cc2c31cf23e/rs/nns/governance/src/governance.rs#L8411
    const FOLLOWING_NOT_ALLOWED_ERROR = /: Neuron \d+ is a private neuron\./;
    if (NON_EXISTENT_NEURON_ERROR.test(errorDetail)) {
      errorMessage = replacePlaceholders(
        $i18n.new_followee.followee_does_not_exist,
        {
          $neuronId: followee.toString(),
        }
      );
    } else if (FOLLOWING_NOT_ALLOWED_ERROR.test(errorDetail)) {
      errorMessage = replacePlaceholders(
        $i18n.new_followee.followee_not_permit,
        {
          $neuronId: followee.toString(),
          $principalId: $authStore.identity?.getPrincipal().toText() ?? "",
        }
      );
    } else {
      toastsShow(toastMessage);
    }
  };

  const updateFollowings = async (followeeAddress: string) => {
    clearError();

    if (followeeAddress.length === 0) {
      return;
    }

    let followee: bigint;
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

    try {
      await setFollowing({
        neuronId: neuron.neuronId,
        topics,
        followee,
      });

      selectedTopics = [];
      openPrevStep();
    } catch (err: unknown) {
      handleUpdateFollowingError({ followee, error: err });
    } finally {
      stopBusy("add-followee");
    }
  };

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
