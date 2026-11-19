<script lang="ts">
  import Input from "$lib/gix/components/Input.svelte";
  import type { InputProps } from "$lib/gix/types/input";

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
