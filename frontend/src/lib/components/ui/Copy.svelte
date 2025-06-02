<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconCheck, IconCopy } from "@dfinity/gix-components";

  const FEEDBACK_DURATION = 2000;

  type Props = {
    value: string;
  };
  const { value }: Props = $props();
  let copied = $state(false);

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await navigator?.clipboard.writeText(value);
    copied = true;

    setTimeout(() => {
      copied = false;
    }, FEEDBACK_DURATION);
  };
</script>

<button
  data-tid="copy-component"
  onclick={copyToClipboard}
  aria-label={`${copied ? $i18n.core.copied : $i18n.core.copy}: ${value}`}
  class:copied
  disabled={copied}
  title={copied ? $i18n.core.copied : $i18n.core.copy}
>
  {#if copied}
    <IconCheck size="20" />
  {:else}
    <IconCopy size="20" />
  {/if}
</button>

<style lang="scss">
  button {
    height: var(--padding-4x);
    width: var(--padding-4x);
    min-width: var(--padding-4x);

    color: var(--primary);
    transition: color var(--animation-time-normal) ease;

    &.copied {
      color: var(--positive-emphasis);
    }
  }
</style>
