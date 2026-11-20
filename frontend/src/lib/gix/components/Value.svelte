<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    ariaLabel?: string;
    testId?: string;
  }

  let { ariaLabel, testId, children }: Props = $props();
</script>

<span class="value" aria-label={ariaLabel} data-tid={testId}>
  {@render children()}
</span>
