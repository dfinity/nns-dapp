<script lang="ts">
  import type { Account } from "../types/account";
  import Card from "./Card.svelte";
  import ICP from "./ICP.svelte";
  import Identifier from "./Identifier.svelte";

  export let account: Account;

  $: ({ identifier, balance } = account);
</script>

<Card>
  <p slot="start"><slot /></p>
  <ICP slot="end" icp={balance} />
  <Identifier {identifier} />
</Card>
