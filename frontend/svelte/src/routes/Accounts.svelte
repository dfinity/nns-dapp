<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { onDestroy } from "svelte";

  // TODO: To be removed once this page has been implemented
  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ signedIn }: AuthStore) => {
      if (signedIn && process.env.REDIRECT_TO_LEGACY) {
        window.location.replace("/#/accounts");
      }
    }
  );

  onDestroy(unsubscribe);
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>Accounts</h1>
    </section>
  </Layout>
{/if}
