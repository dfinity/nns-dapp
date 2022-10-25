<script lang="ts">
  import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
  import SignInNNS from "$lib/pages/SignInNNS.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { project: string | null | undefined };

  let rootCanisterId: string | null | undefined;
  $: ({ project: rootCanisterId } = data);
</script>

{#if signedIn}
  <ProjectDetail {rootCanisterId} />
{:else}
  <SignInNNS />
{/if}
