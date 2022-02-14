<script lang="ts">
  import type { Account } from "../../types/account";
  import Card from "../ui/Card.svelte";
  import ICP from "../ic/ICP.svelte";
  import Identifier from "../ic/Identifier.svelte";
  import { routeStore } from "../../stores/route.store";
  import { AppPath } from "../../../routes/routes";

  export let account: Account;
  export let showCopy: boolean = false;
  export let role: "button" | undefined = undefined;

  $: ({ identifier, balance } = account);

  const cardClick = () =>
    routeStore.navigate({ path: `${AppPath.Wallet}/${identifier}` });
</script>

<Card on:click={cardClick} {role}>
  <p slot="start"><slot /></p>
  <ICP slot="end" icp={balance} />
  <Identifier {identifier} {showCopy} />
</Card>
