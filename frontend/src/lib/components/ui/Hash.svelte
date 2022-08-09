<script lang="ts">
  import { shortenWithMiddleEllipsis } from "../../utils/format.utils";
  import Copy from "./Copy.svelte";

  import Tooltip from "./Tooltip.svelte";

  export let tagName: "h3" | "p" = "h3";
  export let testId: string | undefined = undefined;
  export let id: string;
  export let text: string;

  let shortenText: string;
  $: shortenText = shortenWithMiddleEllipsis(text);
</script>

<span>
  <Tooltip {id} {text}>
    <svelte:element this={tagName} data-tid={testId}
      >{shortenText}</svelte:element
    >
  </Tooltip>
  <Copy value={text} />
</span>

<style lang="scss">
  span {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }
</style>
