<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { i18n } from "../lib/stores/i18n";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/neurons");
    }
  });

  let principalText: string = "";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ principal }: AuthStore) => (principalText = principal?.toText() ?? "")
  );

  onDestroy(unsubscribe);
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.neurons.title}</h1>

      <p>{$i18n.neurons.text}</p>

      <p>
        {$i18n.neurons.principal_is} "{principalText}"
      </p>
    </section>
  </Layout>
{/if}
