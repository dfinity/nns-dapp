<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { createEventDispatcher } from "svelte";
  import Logo from "../ui/Logo.svelte";
  import SingleLineBalance from "../ic/SingleLineBalance.svelte";
  import {
    IconNorthEast,
    IconQRCodeScanner,
    IconRight,
  } from "@dfinity/gix-components";

  export let userToken: UserTokenData;

  const dispatcher = createEventDispatcher();
</script>

<tr on:click={() => dispatcher("nnsRowClick", userToken)}>
  <td>
    <div class="universe-data">
      <Logo src={userToken.logo} alt={userToken.title} size="medium" framed />
      <span>{userToken.title}</span>
    </div>
  </td>
  <td>
    <div class="universe-balance">
      <SingleLineBalance amount={userToken.balance} />
      {#each userToken.actions as action}
        {#if action === "goToDetail"}
          <button
            class="icon"
            on:click|stopPropagation={() => {
              dispatcher("nnsGoToDetail", userToken);
            }}
          >
            <IconRight />
          </button>
        {:else if action === "receive"}
          <button
            class="icon"
            on:click|stopPropagation={() => {
              dispatcher("nnsReceive", userToken);
            }}
          >
            <IconQRCodeScanner />
          </button>
        {:else if action === "send"}
          <button
            class="icon"
            on:click|stopPropagation={() => {
              dispatcher("nnsSend", userToken);
            }}
          >
            <IconNorthEast />
          </button>
        {/if}
      {/each}
    </div>
  </td>
</tr>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  tr td {
    padding: var(--padding-2x);
  }

  tr {
    @include interaction.tappable;

    // background-color: var(--input-focus-background);
    background-color: var(--purple-75);

    &:hover {
      background-color: var(--input-background);
    }
  }

  .universe-data {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .universe-balance {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--padding);

    :global(svg) {
      color: var(--primary);
    }
  }
</style>
