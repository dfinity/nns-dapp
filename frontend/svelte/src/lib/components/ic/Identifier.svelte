<script lang="ts">
  import IconCopy from "../../icons/IconCopy.svelte";
  import { i18n } from "../../stores/i18n";

  export let identifier: string;

  const copyToClipboard = async () =>
    await navigator.clipboard.writeText(identifier);
</script>

<p>
  <small>{identifier}</small>
  <button
    on:click|stopPropagation={copyToClipboard}
    aria-label={$i18n.accounts.copy_identifier}
    class="icon-only"
  >
    <IconCopy />
  </button>
</p>

<style lang="scss">
  small {
    word-break: break-all;
  }

  p {
    margin: 0;
  }
</style>
