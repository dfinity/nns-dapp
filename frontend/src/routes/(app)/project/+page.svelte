<script lang="ts">
  import ProjectDetail from "$lib/pages/ProjectDetail.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
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
  <h1>Proposal NOT signed in</h1>

  <SignIn />
{/if}
