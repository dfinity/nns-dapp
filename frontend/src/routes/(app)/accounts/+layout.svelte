<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import Content from "$lib/components/common/Content.svelte";
  import SplitContent from "$lib/components/common/SplitContent.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { SvelteComponent } from "svelte";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let cmp: typeof SvelteComponent;
  $: cmp = signedIn ? SplitContent : Content;
</script>

<Layout>
  <svelte:component this={cmp}>
    <slot />
  </svelte:component>
</Layout>
