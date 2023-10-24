<script lang="ts">
  import { UserTokenActions, type UserTokenData } from "$lib/types/tokens-page";
  import {
    SvelteComponent,
    createEventDispatcher,
    type ComponentType,
  } from "svelte";
  import Logo from "../../ui/Logo.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import GoToDetailButton from "./actions/GoToDetailButton.svelte";
  import ReceiveButton from "./actions/ReceiveButton.svelte";
  import SendButton from "./actions/SendButton.svelte";

  export let userToken: UserTokenData;

  const dispatcher = createEventDispatcher();

  const actionMapper: Record<
    UserTokenActions,
    ComponentType<SvelteComponent<{ userToken: UserTokenData }>>
  > = {
    [UserTokenActions.GoToDetail]: GoToDetailButton,
    [UserTokenActions.Receive]: ReceiveButton,
    [UserTokenActions.Send]: SendButton,
  };
</script>

<tr
  on:click={() => dispatcher("nnsRowClick", userToken)}
  data-tid="desktop-tokens-table-row-component"
>
  <td>
    <div class="universe-data">
      <Logo src={userToken.logo} alt={userToken.title} size="medium" framed />
      <span>{userToken.title}</span>
    </div>
  </td>
  <td>
    <div class="universe-balance">
      <AmountDisplay singleLine amount={userToken.balance} />
      {#each userToken.actions as action}
        <svelte:component
          this={actionMapper[action]}
          {userToken}
          on:nnsSend
          on:nnsReceive
          on:nnsGoToDetail
        />
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
