<script lang="ts">
  import LogoWrapper from "$lib/components/ui/LogoWrapper.svelte";
  import { Card, IconVote, Tooltip } from "@dfinity/gix-components";

  export let size: "huge" | "big" | "medium" | "small" = "small";
  export let framed = true;
</script>

<LogoWrapper {size} {framed} testId="vote-logo-component">
  <div data-tid="vote-icon">
    <IconVote size="24px" />
  </div>
</LogoWrapper>
