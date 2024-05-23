<script lang="ts">
  import GoToDetailIcon from "./actions/GoToDetailIcon.svelte";
  import ReceiveButton from "./actions/ReceiveButton.svelte";
  import SendButton from "./actions/SendButton.svelte";
  import {
    UserTokenAction,
    type UserTokenData,
    type UserTokenLoading,
  } from "$lib/types/tokens-page";
  import { isUserTokenData } from "$lib/utils/user-token.utils";
  import { nonNullish } from "@dfinity/utils";
  import type { SvelteComponent, ComponentType } from "svelte";

  export let userTokenData: UserTokenData | UserTokenLoading;

  const actionMapper: Record<
    UserTokenAction,
    ComponentType<SvelteComponent<{ userToken: UserTokenData }>>
  > = {
    [UserTokenAction.GoToDetail]: GoToDetailIcon,
    [UserTokenAction.Receive]: ReceiveButton,
    [UserTokenAction.Send]: SendButton,
  };

  let userToken: UserTokenData | undefined;
  $: userToken = isUserTokenData(userTokenData) ? userTokenData : undefined;
</script>

{#if nonNullish(userToken)}
  {#each userToken.actions as action}
    <svelte:component this={actionMapper[action]} {userToken} on:nnsAction />
  {/each}
{/if}
