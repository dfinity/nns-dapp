<script lang="ts">
  import { IconClose } from "@dfinity/gix-components";
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

<div
  class="container"
  data-tid="follow-sns-neurons-by-topic-followee-component"
>
  <Hash text={neuronIdHex} id={neuronIdHex} tagName="span" showCopy />
  <button
    class="remove-button icon-only"
    aria-label={$i18n.core.remove}
    onclick={onRemoveClick}><IconClose /></button
  >
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .container {
    @include fonts.small(true);

    display: flex;
    align-items: center;
    padding-left: var(--padding);
    border-radius: var(--border-radius-0_5x);
    background-color: var(--tag-background);
    color: var(--tag-text);
  }

  .remove-button {
    display: flex;
    align-items: center;
    // TODO(sns-topics): Add --Copy-color to the gix/Copy and use --icon-color for both buttons.
    color: var(--primary);
    // Decrease the gap between copy and remove buttons.
    padding-left: 0;
  }
</style>
