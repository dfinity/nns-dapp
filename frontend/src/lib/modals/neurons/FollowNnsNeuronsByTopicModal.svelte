<script lang="ts">
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import FollowNnsNeuronsByTopicStepNeuron from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepNeuron.svelte";
  import FollowNnsNeuronsByTopicStepTopics from "$lib/modals/neurons/FollowNnsNeuronsByTopicStepTopics.svelte";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { setFollowing } from "$lib/services/neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { mapNeuronErrorToToastMessage } from "$lib/utils/error.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    WizardModal,
    wizardStepIndex,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { Topic, type NeuronId } from "@dfinity/nns";
  import { onMount } from "svelte";

  type Props = {
    neuronId: NeuronId;
    onClose: () => void;
  };
  const { neuronId, onClose }: Props = $props();

  const STEP_TOPICS = "topics";
  const STEP_NEURON = "neuron";

  const steps: WizardSteps = [
    {
      name: STEP_TOPICS,
      title: $i18n.follow_sns_topics.topics_title,
    },
    {
      name: STEP_NEURON,
      title: $i18n.follow_sns_topics.neuron_title,
    },
  ];

  // Load KnownNeurons which are used in the FollowNnsTopicSections
  onMount(listKnownNeurons);

  const neuron = $derived(
    $definedNeuronsStore.find(({ neuronId: id }) => id === neuronId)
  )!;

  let currentStep: WizardStep | undefined = $state();
  let modal: WizardModal<string> | undefined = $state();
  let selectedTopics = $state<Topic[]>([]);
  let errorMessage: string | undefined = $state();

  const openNextStep = () => {
    modal?.set(wizardStepIndex({ name: STEP_NEURON, steps }));
  };

  const openFirstStep = () => {
    modal?.set(wizardStepIndex({ name: STEP_TOPICS, steps }));
  };

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
        topics: selectedTopics,
        followee,
      });

      selectedTopics = [];
      openFirstStep();
    } catch (err: unknown) {
      handleUpdateFollowingError({ followee, error: err });
    } finally {
      stopBusy("add-followee");
    }
  };
</script>

<WizardModal
  testId="follow-nns-neurons-by-topic-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  {onClose}
>
  {#snippet title()}{currentStep?.title}{/snippet}

  {#if currentStep?.name === STEP_TOPICS}
    <FollowNnsNeuronsByTopicStepTopics
      {neuron}
      bind:selectedTopics
      {onClose}
      {openNextStep}
    />
  {/if}

  {#if currentStep?.name === STEP_NEURON}
    <FollowNnsNeuronsByTopicStepNeuron
      {neuron}
      topics={selectedTopics}
      {updateFollowings}
      openPrevStep={openFirstStep}
      {clearError}
      {errorMessage}
    />
  {/if}
</WizardModal>
