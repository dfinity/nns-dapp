<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
  import { E8S_PER_ICP } from "../lib/contants/icp.constants";

  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/accounts");
    }
  });

  const unsubscribe: Unsubscriber = authStore.subscribe(
    async ({ principal }: AuthStore) => {
      const ledger: LedgerCanister = LedgerCanister.create();

      const balance: ICP = await ledger.accountBalance(
        AccountIdentifier.fromPrincipal(principal),
        false
      );

      // TODO:
      // - extract ledger code
      // - extract number format
      // - add local state

      console.log(
        `Balance: ${new Intl.NumberFormat("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 8,
        }).format(Number(balance.toE8s()) / E8S_PER_ICP).replace(',', '.')}`
      );
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
