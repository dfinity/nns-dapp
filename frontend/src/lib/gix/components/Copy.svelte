<script lang="ts">
  import { IconCopy } from "$lib/gix/icons";
  import { i18n } from "$lib/gix/stores/i18n";
  import {
    stopPropagation,
    preventDefault,
  } from "$lib/gix/utils/event-modifiers.utils";

  interface Props {
    value: string;
  }

  let { value }: Props = $props();

  const copyToClipboard = async () =>
    await navigator.clipboard.writeText(value);
</script>

<button
  class="icon-only"
  aria-label={`${$i18n.core.copy}: ${value}`}
  data-tid="copy-component"
  onclick={preventDefault(stopPropagation(copyToClipboard))}
  type="button"
>
  <IconCopy />
</button>

<style lang="scss">
  button {
    height: var(--padding-4x);
    width: var(--padding-4x);
    min-width: var(--padding-4x);

    &.icon-only {
      color: var(--primary);
    }
  }
</style>
