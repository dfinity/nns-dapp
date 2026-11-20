<script lang="ts">
  import LogoWrapper from "$lib/components/ui/LogoWrapper.svelte";
  import { IconVote } from "$lib/gix";

  export let size: "huge" | "big" | "medium" | "small" = "small";
  export let framed = true;
</script>

<LogoWrapper {size} {framed} testId="vote-logo-component">
  <div data-tid="vote-icon">
    <IconVote size="24px" />
  </div>
</LogoWrapper>
