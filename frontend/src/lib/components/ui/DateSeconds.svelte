<script lang="ts">
  import { secondsToDate, secondsToTime } from "../../utils/date.utils";

  export let tagName: "p" | "dd" | "span" = "p";
  export let seconds: number;
</script>

<svelte:element this={tagName} style="margin-top: 0;" data-tid="date-seconds"
  >{secondsToDate(seconds)} {secondsToTime(seconds)}</svelte:element
>
