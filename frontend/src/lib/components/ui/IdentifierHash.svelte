<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";

  export let identifier: string;
</script>

<Hash
  id="identifier"
  tagName="p"
  testId="identifier"
  text={identifier}
  showCopy
/>
