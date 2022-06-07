<script lang="ts">
  import type { CanisterDetails } from "../../canisters/ic-management/ic-management.canister.types";
  import { i18n } from "../../stores/i18n";
  import Card from "../ui/Card.svelte";
  import AddCanisterControllerButton from "./AddCanisterControllerButton.svelte";

  export let canisterDetails: CanisterDetails;

  const remove = (controller: string) => {
    // TODO: Remove Controller - https://dfinity.atlassian.net/browse/L2-601
    console.log("remove controller", controller);
  };
</script>

<Card testId="canister-controllers-card">
  <h4 slot="start">{$i18n.canister_detail.controllers}</h4>
  <ul>
    {#each canisterDetails.setting.controllers as controller (controller)}
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
    <AddCanisterControllerButton canisterId={canisterDetails.id} />
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
