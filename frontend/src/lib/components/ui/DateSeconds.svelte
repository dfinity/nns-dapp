<script lang="ts">
  import { secondsToDate, secondsToTime } from "../../utils/date.utils";

  export let tagName: "p" | "dd" = "p";
  export let seconds: number;
</script>

<svelte:element this={tagName}
  >{secondsToDate(seconds)} {secondsToTime(seconds)}</svelte:element
>

<style lang="scss">
  p {
    margin-top: 0;
  }
</style>
