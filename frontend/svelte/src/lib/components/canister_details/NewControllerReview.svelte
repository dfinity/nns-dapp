<script lang="ts">
  import { busy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;
  export let controller: Principal;

  const add = () => {
    // TODO: Add controller
    console.log("adding");
  };
</script>

<form
  on:submit|preventDefault={add}
  class="wizard-wrapper"
  data-tid="new-controller-review-screen"
>
  <div>
    <h5>{$i18n.canisters.canister_id}</h5>
    <p>{canisterId.toText()}</p>
    <h5>{$i18n.canister_detail.new_controller}</h5>
    <p>{controller.toText()}</p>
  </div>
  <button class="primary full-width" type="submit" disabled={$busy}>
    {$i18n.accounts.confirm_and_send}
  </button>
</form>

<style lang="scss">
  div {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  p {
    margin-bottom: var(--padding-3x);
  }
</style>
