<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Html } from "@dfinity/gix-components";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";

  type Props = {
    followeeHex: string;
    errorMessage?: string;
    openPrevStep: () => void;
    addFollowing: (followeeHex: string) => void;
  };
  let {
    followeeHex = $bindable(),
    errorMessage,
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
  <InputWithError
    testId="new-followee-id"
    inputType="text"
    autocomplete="off"
    placeholderLabelKey="new_followee.placeholder"
    name="new-followee-id"
    {errorMessage}
    bind:value={followeeHex}
    on:nnsInput={() => {
      // Hide error message when user starts typing
      errorMessage = undefined;
    }}
  >
    <svelte:fragment slot="label"
      ><h5 class="label">{$i18n.follow_sns_topics.neuron_label}</h5
      ></svelte:fragment
    >
  </InputWithError>

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

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .label {
    margin: 0;
  }

  .description {
    @include fonts.small(true);
  }
</style>
