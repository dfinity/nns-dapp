<script lang="ts">
  import DayInput from "$lib/components/ui/DayInput.svelte";

  export let seconds: number;
  export let maxInSeconds: number;
  export let minInSeconds: number;
  export let getInputError: (value: number) => string | undefined;
</script>

<DayInput bind:seconds {maxInSeconds} {getInputError} {minInSeconds} />

<p data-tid="seconds">{seconds}</p>
