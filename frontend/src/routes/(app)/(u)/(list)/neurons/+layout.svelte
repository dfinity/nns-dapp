<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { SvelteComponent } from "svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let cmp: typeof SvelteComponent;
  $: cmp = signedIn ? UniverseSplitContent : Content;
</script>

<Layout>
  <svelte:component this={cmp}>
    <slot />
  </svelte:component>
</Layout>
