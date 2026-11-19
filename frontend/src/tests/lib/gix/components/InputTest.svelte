<script lang="ts">
  import Input, {
    type Props as InputProps,
  } from "$lib/gix/components/Input.svelte";

  // eslint-disable-next-line svelte/valid-compile
  let props: InputProps = $props();
</script>

<Input {...props}>
  {#snippet end()}
    <button>Test Button</button>
  {/snippet}
  {#snippet start()}
    <button>Left Button</button>
  {/snippet}
</Input>
