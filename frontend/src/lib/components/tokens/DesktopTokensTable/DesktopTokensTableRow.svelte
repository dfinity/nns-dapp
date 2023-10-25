<script lang="ts">
  import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
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
  import { ActionType } from "$lib/types/actions";

  export let userTokenData: UserTokenData;

  const dispatcher = createEventDispatcher();

  const actionMapper: Record<
    UserTokenAction,
    ComponentType<SvelteComponent<{ userToken: UserTokenData }>>
  > = {
    [UserTokenAction.GoToDetail]: GoToDetailButton,
    [UserTokenAction.Receive]: ReceiveButton,
    [UserTokenAction.Send]: SendButton,
  };
</script>

<tr
  on:click={() =>
    dispatcher("nnsAction", {
      type: ActionType.GoToTokenDetail,
      data: userTokenData,
    })}
  data-tid="desktop-tokens-table-row-component"
>
  <td>
    <div class="universe-data">
      <Logo
        src={userTokenData.logo}
        alt={userTokenData.title}
        size="medium"
        framed
      />
      <span>{userTokenData.title}</span>
    </div>
  </td>
  <td>
    <div class="universe-balance">
      <AmountDisplay singleLine amount={userTokenData.balance} />
      {#each userTokenData.actions as action}
        <svelte:component
          this={actionMapper[action]}
          userToken={userTokenData}
          on:nnsAction
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
