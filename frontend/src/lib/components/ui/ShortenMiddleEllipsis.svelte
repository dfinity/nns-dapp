<script lang="ts">
  import { shortenWithMiddleEllipsis } from "../../utils/format.utils";

  import Tooltip from "./Tooltip.svelte";

  export let tagName: "h3" | "p" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string;
  export let text: string;

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text);
</script>

<Tooltip {id} {text}>
  <svelte:element this={tagName} data-tid={testId}>{shortenText}</svelte:element
  >
</Tooltip>
