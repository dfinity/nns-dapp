<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Input from "$lib/components/ui/Input.svelte";
  import { Html } from "@dfinity/gix-components";

  interface Props {
    followeeHex: string;
    openPrevStep: () => void;
    addFollowing: (followeeHex: string) => void;
  }
  let {
    followeeHex = $bindable(),
    openPrevStep,
    addFollowing,
  }: Props = $props();
</script>

<form
  data-tid="follow-sns-neurons-by-topic-step-neuron-component"
  onsubmit={(event) => {
    event.preventDefault();
    addFollowing(followeeHex);
  }}
>
  <Input
    testId="new-followee-id"
    inputType="text"
    autocomplete="off"
    placeholderLabelKey="new_followee.placeholder"
    name="new-followee-id"
    bind:value={followeeHex}
  >
    <svelte:fragment slot="label"
      >{$i18n.follow_sns_topics.neuron_label}</svelte:fragment
    >
  </Input>

  <p class="description"
    ><Html text={$i18n.follow_sns_topics.neuron_description} /></p
  >

  <div class="toolbar">
    <button
      data-tid="back-button"
      class="secondary"
      type="button"
      onclick={openPrevStep}
    >
      {$i18n.core.back}
    </button>
    <button
      class="primary"
      type="submit"
      data-tid="add-followee-button"
      disabled={followeeHex.length === 0}
    >
      {$i18n.follow_sns_topics.neuron_follow}
    </button>
  </div>
</form>
