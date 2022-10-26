<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { Toasts } from "@dfinity/gix-components";
  import BusyScreen from "$lib/components/ui/BusyScreen.svelte";
</script>

<Layout>
  <slot />
</Layout>

<Toasts />
<BusyScreen />
