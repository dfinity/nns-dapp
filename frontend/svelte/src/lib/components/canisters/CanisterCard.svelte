<script lang="ts">
  import type { CanisterDetails } from "../../canisters/nns-dapp/nns-dapp.types";
  import Card from "../ui/Card.svelte";

  export let canister: CanisterDetails;
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;

  let canisterId: string;
  $: canisterId = canister.canister_id.toText();
  let title: string;
  $: title = canister.name.length > 0 ? canister.name : canisterId;
</script>

<Card {role} {ariaLabel} on:click testId="canister-card">
  <h3 slot="start">{title}</h3>
  <p>{canisterId}</p>
</Card>
