<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import { Html } from "@dfinity/gix-components";

  const dispatch = createEventDispatcher();

  export let followeeHex = "";
</script>

<form on:submit|preventDefault={() => dispatch("nnsConfirm", { followeeHex })}>
  <Input
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
      class="secondary"
      type="button"
      on:click={() => dispatch("nnsBack")}
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
</style>
