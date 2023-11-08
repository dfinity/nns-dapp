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
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import TokenBalance from "../TokenBalance.svelte";

  export let userTokenData: UserTokenData;
  export let index: number;

  const dispatcher = createEventDispatcher();

  const actionMapper: Record<
    UserTokenAction,
    ComponentType<SvelteComponent<{ userToken: UserTokenData }>>
  > = {
    [UserTokenAction.GoToDetail]: GoToDetailButton,
    [UserTokenAction.Receive]: ReceiveButton,
    [UserTokenAction.Send]: SendButton,
  };

  const handleClick = () =>
    dispatcher("nnsAction", {
      type: ActionType.GoToTokenDetail,
      data: userTokenData,
    });
</script>

<div
  role="row"
  tabindex={index + 1}
  on:keypress={handleClick}
  on:click={handleClick}
  data-tid="desktop-tokens-table-row-component"
>
  <div role="cell">
    <div class="universe-data">
      <Logo
        src={userTokenData.logo}
        alt={userTokenData.title}
        size="medium"
        framed
      />
      <span>{userTokenData.title}</span>
    </div>
  </div>
  <div role="cell">
    <div class="universe-balance">
      <div class="desktop-balance">
        <TokenBalance {userTokenData} />
      </div>
      {#each userTokenData.actions as action}
        <svelte:component
          this={actionMapper[action]}
          userToken={userTokenData}
          on:nnsAction
        />
      {/each}
    </div>
  </div>
  <div role="cell" class="mobile-balance">
    <span>Balance</span>
    <TokenBalance {userTokenData} />
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div[role="row"] {
    @include interaction.tappable;

    display: grid;
    align-items: center;
    row-gap: var(--padding);
    grid-template-columns: 2fr 1fr;
    grid-template-rows: repeat(2, 1fr);

    padding: var(--padding-2x);

    background-color: var(--table-row-background);

    @include media.min-width(medium) {
      grid-template-rows: 1fr;
    }

    &:hover {
      background-color: var(--table-row-background-hover);
    }
  }

  div[role="cell"] > * {
    height: 100%;
  }

  .universe-data {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .desktop-balance {
    display: none;

    @include media.min-width(medium) {
      display: block;
    }
  }

  .mobile-balance {
    display: flex;
    justify-content: space-between;
    grid-column-end: span 2;

    @include media.min-width(medium) {
      display: none;
    }
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
