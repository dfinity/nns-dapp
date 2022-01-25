<script lang="ts">
  import IconCopy from "../icons/IconCopy.svelte";
  import { i18n } from "../stores/i18n";

  export let identifier: string;

  const copyToClipboard = async () =>
    await navigator.clipboard.writeText(identifier);
</script>

<p>
  <small>{identifier}</small>
  <button
    on:click={copyToClipboard}
    aria-label={$i18n.accounts.copy_identifier}
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

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    vertical-align: bottom;

    padding: calc(var(--padding) / 2);

    border-radius: 50%;

    transition: background 0.2s;

    &:hover,
    &:active {
      background: var(--gray-50-background);
    }
  }
</style>
