<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import IdentifierPlain from "$lib/components/ui/IdentifierPlain.svelte";

  export let identifier: string;
  export let label: string | undefined = undefined;
  export let showCopy = false;
  export let size: "small" | "medium" = "small";
</script>

{#if size === "small"}
  <Hash id="identifier" tagName="p" testId="identifier" text={identifier} />
{:else}
  <IdentifierPlain {size} {label} {identifier} {showCopy} />
{/if}
