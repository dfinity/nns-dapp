<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";

  export let identifier: string;
  export let splitLength: number | undefined = undefined;
</script>

<Hash
  id="identifier"
  tagName="p"
  testId="identifier"
  text={identifier}
  showCopy
  {splitLength}
/>
