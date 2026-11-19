<script lang="ts">
  import ProgressBar from "$lib/gix/components/ProgressBar.svelte";

  export let value: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let top: string | undefined = undefined;
  export let bottom: string | undefined = undefined;
</script>

<ProgressBar {max} {value}>
  <p slot="top">
    {top}
  </p>
  <p slot="bottom">
    {bottom}
  </p>
</ProgressBar>
