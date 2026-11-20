<script lang="ts">
  import InputRange from "$lib/gix/components/InputRange.svelte";

  let value = 25;

  const change = () => (value = 60);
</script>

<button data-tid="change-test-value" on:click={change}>Click</button>
<InputRange ariaLabel="test" max={100} min={0} bind:value />
