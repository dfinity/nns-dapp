<script lang="ts">
  import type { Account } from "../../types/account";
  import Card from "../ui/Card.svelte";
  import ICP from "../ic/ICP.svelte";
  import Identifier from "../ic/Identifier.svelte";

  export let account: Account;
  export let showCopyIcon: boolean = true;
  export let role: "button" | undefined = undefined;

  $: ({ identifier, balance } = account);
</script>

<Card on:click {role}>
  <p slot="start"><slot /></p>
  <ICP slot="end" icp={balance} />
  <Identifier {identifier} {showCopyIcon} />
</Card>
