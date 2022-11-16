<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  const back = (): Promise<void> => goto(AppPath.Neurons);
</script>

<Layout contrast {back}>
  <slot />
</Layout>
