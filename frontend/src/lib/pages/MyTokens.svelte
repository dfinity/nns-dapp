<script lang="ts">
  import {
    createFavoriteAction,
    createOpenModalAction,
  } from "$lib/types/actions";
  import { createEventDispatcher } from "svelte";

  export let data: { name: string; balance: string; id: string }[] = [];

  const dispatcher = createEventDispatcher();
</script>

<div>
  <h1>My Tokens</h1>

  <div>
    {#each data as { name, balance, id }}
      <div>
        <div>{name}</div>
        <div>{balance}</div>
        <button
          class="secondary"
          on:click={() => {
            dispatcher("nnsAction", createFavoriteAction({ id }));
          }}>Add to favorite</button
        >
        <button
          class="secondary"
          on:click={() => {
            dispatcher(
              "nnsAction",
              createOpenModalAction({ id, fromAccount: name })
            );
          }}>Send Tokens</button
        >
      </div>
    {/each}
  </div>
</div>
