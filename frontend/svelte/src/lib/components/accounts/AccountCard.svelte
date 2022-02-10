<script lang="ts">
  import type { Account } from "../../types/account";
  import Card from "../ui/Card.svelte";
  import ICP from "../ic/ICP.svelte";
  import Identifier from "../ic/Identifier.svelte";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../../routes/routes";

  export let account: Account;

  $: ({ identifier, balance } = account);

  const cardClick = () =>
    routeStore.navigate({ path: `${AppPath.Wallet}/${identifier}` });
</script>

<Card on:click={cardClick}>
  <p slot="start"><slot /></p>
  <ICP slot="end" icp={balance} />
  <Identifier {identifier} />
</Card>
