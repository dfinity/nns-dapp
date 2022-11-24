<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { Island } from '@dfinity/gix-components';

  const back = (): Promise<void> => goto(AppPath.Canisters);
</script>

<Layout {back}>
  <Island>
    <slot />
  </Island>
</Layout>
