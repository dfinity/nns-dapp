<script lang="ts" context="module">
  let nextElementIdNumber = 0;
</script>

<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";

  export let identifier: string;
  export let splitLength: number | undefined = undefined;

  let elementId = `identifier-${nextElementIdNumber++}`;
</script>

<Hash
  id={elementId}
  tagName="p"
  testId="identifier"
  text={identifier}
  showCopy
  {splitLength}
/>
