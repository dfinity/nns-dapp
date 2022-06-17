<script lang="ts">
  import IconCopy from "../../icons/IconCopy.svelte";
  import { i18n } from "../../stores/i18n";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy: boolean = false;
  export let size: "small" | "medium" = "small";

  let labelText: string;
  $: labelText = label === undefined ? "" : `${label} `;

  const copyToClipboard = async () =>
    await navigator.clipboard.writeText(identifier);
</script>

<p>
  <span data-tid="identifier" class:text_small={size === "small"}
    >{labelText}{identifier}</span
  >
  {#if showCopy}
    <button
      on:click|stopPropagation={copyToClipboard}
      aria-label={labelText + $i18n.accounts.copy_identifier}
      class="icon-only"
    >
      <IconCopy />
    </button>
  {/if}
</p>

<style lang="scss">
  span {
    word-break: break-all;
  }

  p {
    margin: 0;
  }
</style>
