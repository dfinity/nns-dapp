<script lang="ts">
  import { definedNeuronsStore } from "$lib/derived/neurons.derived";
  import { startBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { topicsToFollow } from "$lib/utils/neuron.utils";
  import { sortNnsTopics } from "$lib/utils/proposals.utils";
  import {
    stopBusy,
    WizardModal,
    wizardStepIndex,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import type { NeuronId, Topic } from "@dfinity/nns";
  import FollowNnsNeuronsByTopicStepTopics from "./FollowNnsNeuronsByTopicStepTopics.svelte";

  type Props = {
    neuronId: NeuronId;
    closeModal: () => void;
    reloadNeuron?: () => Promise<void>;
  };
  const { neuronId, closeModal, reloadNeuron }: Props = $props();

  const STEP_TOPICS = "topics";
  const STEP_NEURON = "neurons";
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

  let currentStep: WizardStep | undefined = $state();
  let modal: WizardModal | undefined = $state();

  const neuron = $derived(
    $definedNeuronsStore.find(({ neuronId: id }) => id === neuronId)
  );
  const sortedTopics = $derived(
    neuron ? sortNnsTopics({ topics: topicsToFollow(neuron), i18n: $i18n }) : []
  );
  let selectedTopics: Topic[] = $state([]);

  const openNextStep = () => {
    modal?.set(wizardStepIndex({ name: STEP_NEURON, steps }));
  };

  const addFollowing = async (followeeHex: string) => {
    startBusy({
      initiator: "add-followee-by-topic",
      labelKey: "follow_sns_topics.busy_updating",
    });

    // if (!(await validateNeuronId(followeeNeuronId))) {
    //   stopBusy("add-followee-by-topic");
    //   neuronErrorMessage = replacePlaceholders(
    //     $i18n.follow_sns_topics.error_neuron_not_exist,
    //     {
    //       $neuronId: followeeHex,
    //     }
    //   );
    //   return;
    // }

    // const followingsToSet = addSnsNeuronToFollowingsByTopics({
    //   topics: selectedTopics,
    //   neuronId: followeeNeuronId,
    //   followings,
    // });

    // if (followingsToSet.length === 0) {
    //   stopBusy("add-followee-by-topic");
    //   neuronErrorMessage = $i18n.follow_sns_topics.error_already_following;
    //   return;
    // }

    // const { success, error } = await setFollowing({
    //   rootCanisterId,
    //   neuronId: fromDefinedNullable(neuron.id),
    //   followings: followingsToSet,
    // });

    // if (success) {
    //   await reloadNeuron();
    //   // Reset forms state
    //   selectedTopics = [];
    //   followeeNeuronIdHex = "";

    //   openFirstStep();
    //   toastsSuccess({
    //     labelKey: $i18n.follow_sns_topics.success_set_following,
    //   });
    // } else {
    //   toastsError({
    //     labelKey: "follow_sns_topics.error_add_following",

    //     err: error,
    //   });
    // }

    stopBusy("add-followee-by-topic");
  };

  const removeFollowing = async ({
    topic,
    neuronId,
  }: {
    topic: Topic;
    neuronId: NeuronId;
  }) => {
    startBusy({
      initiator: "remove-followee-by-topic",
      labelKey: "follow_sns_topics.busy_removing",
    });

    // const { success, error } = await setFollowing({
    //   rootCanisterId,
    //   neuronId: fromDefinedNullable(neuron.id),
    //   followings: removeSnsNeuronFromFollowingsByTopics({
    //     followings,
    //     topics: [topicKey],
    //     neuronId,
    //   }),
    // });

    // if (success) {
    //   await reloadNeuron();
    // } else {
    //   toastsError({
    //     labelKey: "follow_sns_topics.error_remove_following",
    //     err: error,
    //   });
    // }

    stopBusy("remove-followee-by-topic");
  };
</script>

<WizardModal
  testId="follow-nns-neurons-by-topic-modal"
  {steps}
  bind:currentStep
  bind:this={modal}
  on:nnsClose={closeModal}
>
  <svelte:fragment slot="title">{currentStep?.title}</svelte:fragment>

  {#if currentStep?.name === STEP_TOPICS}
    <FollowNnsNeuronsByTopicStepTopics
      {neuron}
      {closeModal}
      {openNextStep}
      {addFollowing}
      {removeFollowing}
      topics={sortedTopics}
      bind:selectedTopics
    />
  {/if}

  {#if currentStep?.name === STEP_NEURON}
    <!-- Show the Modal with the field to select a Neuron to follow -->
  {/if}
</WizardModal>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  // Ensure all tag backgrounds in the modal are visible in dark mode.
  @include media.dark-theme {
    // Same color as the checkbox background on the first step.
    --tag-background: var(--input-background);
  }
</style>
