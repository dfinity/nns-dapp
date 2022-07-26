<script lang="ts">
  import IconCopy from "../../icons/IconCopy.svelte";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";

  export let value: string;

  const copyToClipboard = async () =>
    await navigator.clipboard.writeText(value);
</script>

<button
  on:click|stopPropagation={copyToClipboard}
  aria-label={replacePlaceholders($i18n.core.copy, {
    $value: value,
  })}
  class="icon-only"
>
  <IconCopy />
</button>

<style lang="scss">
  button {
    height: 30px;
    width: 30px;
    padding: var(--padding-0_5x) var(--padding-0_5x) 0;
  }
</style>
