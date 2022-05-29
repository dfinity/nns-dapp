<script lang="ts">
  import InputRange from "../../../../lib/components/ui/InputRange.svelte";

  let value = 25;

  const change = () => (value = 60);
</script>

<button data-tid="change-test-value" on:click={change}>Click</button>
<InputRange ariaLabel="test" min={0} max={100} bind:value />
