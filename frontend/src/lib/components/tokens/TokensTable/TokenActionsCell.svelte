<script lang="ts">
  import {
    UserTokenAction,
    type UserTokenFailed,
    type UserTokenData,
    type UserTokenLoading,
  } from "$lib/types/tokens-page";
  import {
    isUserTokenData,
    isUserTokenFailed,
  } from "$lib/utils/user-token.utils";
  import GoToDashboardButton from "./actions/GoToDashboardButton.svelte";
  import GoToDetailIcon from "./actions/GoToDetailIcon.svelte";
  import ReceiveButton from "./actions/ReceiveButton.svelte";
  import RemoveButton from "./actions/RemoveButton.svelte";
  import SendButton from "./actions/SendButton.svelte";
  import { nonNullish } from "@dfinity/utils";
  import type { SvelteComponent, ComponentType } from "svelte";

  export let rowData: UserTokenData | UserTokenLoading | UserTokenFailed;

  const actionMapper: Record<
    UserTokenAction,
    ComponentType<SvelteComponent<{ userToken: UserTokenData }>>
  > = {
    [UserTokenAction.GoToDetail]: GoToDetailIcon,
    [UserTokenAction.Receive]: ReceiveButton,
    [UserTokenAction.Send]: SendButton,
    [UserTokenAction.GoToDashboard]: GoToDashboardButton,
    [UserTokenAction.Remove]: RemoveButton,
  };

  let userToken: UserTokenData | UserTokenFailed | undefined;
  $: userToken =
    isUserTokenData(rowData) || isUserTokenFailed(rowData)
      ? rowData
      : undefined;
</script>

{#if nonNullish(userToken)}
  <div class="container">
    {#each userToken.actions as action}
      <svelte:component this={actionMapper[action]} {userToken} on:nnsAction />
    {/each}
  </div>
{/if}

<style lang="scss">
  .container {
    color: var(--primary);
    display: flex;
    height: 28px;
    align-items: center;
    gap: var(--padding);
  }
</style>
