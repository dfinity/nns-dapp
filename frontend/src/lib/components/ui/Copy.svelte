<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconCopy } from "@dfinity/gix-components";

  type Props = {
    value: string;
  };
  const { value }: Props = $props();

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator?.clipboard.writeText(value);
  };
</script>

<button
  data-tid="copy-component"
  onclick={copyToClipboard}
  aria-label={`${$i18n.core.copy}: ${value}`}
  class="icon-only"
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
