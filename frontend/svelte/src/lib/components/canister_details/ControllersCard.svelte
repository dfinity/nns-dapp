<script lang="ts">
  import { getContext } from "svelte";

  import type { CanisterDetails } from "../../canisters/ic-management/ic-management.canister.types";
  import { i18n } from "../../stores/i18n";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
  } from "../../types/canister-detail.context";
  import Card from "../ui/Card.svelte";
  import AddCanisterControllerButton from "./AddCanisterControllerButton.svelte";

  const { store }: CanisterDetailsContext = getContext<CanisterDetailsContext>(
    CANISTER_DETAILS_CONTEXT_KEY
  );
  let canisterDetails: CanisterDetails | undefined;
  $: canisterDetails = $store.details;
  let controllers: string[];
  $: controllers = canisterDetails?.settings.controllers ?? [];

  const remove = (controller: string) => {
    // TODO: Remove Controller - https://dfinity.atlassian.net/browse/L2-601
    console.log("remove controller", controller);
  };
</script>

<Card testId="canister-controllers-card">
  <h4 slot="start">{$i18n.canister_detail.controllers}</h4>
  <ul>
    {#each controllers as controller (controller)}
      <li>
        <span>{controller}</span>
        <button
          class="text"
          aria-label={$i18n.core.close}
          on:click={() => remove(controller)}
          data-tid="remove-canister-controller-button">x</button
        >
      </li>
    {/each}
  </ul>
  <div class="actions">
    <AddCanisterControllerButton />
  </div>
</Card>

<style lang="scss">
  @use "../../themes/mixins/card.scss";
  .actions {
    display: flex;
    justify-content: flex-end;
  }

  ul {
    @include card.list;
  }

  li {
    @include card.list-item;
  }
</style>
