<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Input from "$lib/components/ui/Input.svelte";
  import { Html } from "@dfinity/gix-components";

  export let followeeHex = "";
  export let onNnsBack: () => void;
  export let onNnsConfirm: (followeeHex: string) => void;
</script>

<form
  data-tid="follow-sns-neurons-by-topic-step-neuron-component"
  on:submit|preventDefault={() => onNnsConfirm(followeeHex)}
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
      on:click={onNnsBack}
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
