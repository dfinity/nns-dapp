<script lang="ts">
  import ProjectDetail from "$lib/pages/ProjectDetail.svelte";

  // Preloaded by +page.ts
  export let data: { project: string | null | undefined };

  let rootCanisterId: string | null | undefined;
  $: ({ project: rootCanisterId } = data);
</script>

<ProjectDetail {rootCanisterId} />
