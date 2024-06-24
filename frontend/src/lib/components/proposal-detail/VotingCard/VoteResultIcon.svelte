<script lang="ts">
  import { IconThumbDown, IconThumbUp } from "@dfinity/gix-components";
  import { Vote } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  export let vote: Vote;

  const voteIconMapper = {
    [Vote.No]: IconThumbDown,
    [Vote.Yes]: IconThumbUp,
    [Vote.Unspecified]: undefined,
  };
</script>

{#if nonNullish(voteIconMapper[vote])}
  <svelte:component this={voteIconMapper[vote]} />
{/if}
