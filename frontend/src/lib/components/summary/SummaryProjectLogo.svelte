<script lang="ts">
  import type { SnsSummary } from "$lib/types/sns";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";

  export let size: "big" | "small" = "small";
  export let selectProjects = ENABLE_SNS;

  let summary: SnsSummary | undefined;
  $: summary = selectProjects ? $snsProjectSelectedStore?.summary : undefined;
</script>

<ProjectLogo {size} {summary} />
