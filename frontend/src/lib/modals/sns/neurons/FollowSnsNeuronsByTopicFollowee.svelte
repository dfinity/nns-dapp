<script lang="ts">
  import { IconClose, Tag } from "@dfinity/gix-components";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsTopicFollowee } from "$lib/types/sns";

  interface Props {
    followee: SnsTopicFollowee;
    onRemoveClick: () => void;
  }

  let { followee, onRemoveClick }: Props = $props();

  let neuronIdHex: string = $derived(
    subaccountToHexString(followee.neuronId.id)
  );
</script>

<div data-tid="follow-sns-neurons-by-topic-followee-component">
  <Tag>
    <Hash text={neuronIdHex} id={neuronIdHex} tagName="span" showCopy />
    <button
      class="remove-button text"
      aria-label={$i18n.core.remove}
      onclick={onRemoveClick}><IconClose /></button
    >
  </Tag>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  div {
    @include fonts.standard(true);
    display: flex;
    align-items: center;
  }

  .remove-button {
    display: flex;
    align-items: center;
    color: var(--primary);

    &:hover {
      color: var(--negative-emphasis);
    }
  }
</style>
