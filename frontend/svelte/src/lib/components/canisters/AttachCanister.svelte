<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import { getPrincipalFromString } from "../../utils/accounts.utils";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { attachCanister } from "../../services/canisters.services";
  import { createEventDispatcher } from "svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import PrincipalInput from "../ui/PrincipalInput.svelte";

  let address: string = "";
  let validPrincipal: Principal | undefined;
  $: validPrincipal = getPrincipalFromString(address);
  let showError: boolean = false;
  // Hide error on change
  $: address, (showError = false);

  const dispatcher = createEventDispatcher();
  const attach = async () => {
    // Edge case: button is only enabled when validPrincipal is defined
    if (validPrincipal === undefined) {
      toastsStore.error({
        labelKey: "error.principal_not_valid",
      });
      return;
    }
    startBusy({ initiator: "attach-canister" });
    const { success } = await attachCanister(validPrincipal);
    if (success) {
      toastsStore.success({
        labelKey: "canisters.link_canister_success",
      });
    }
    stopBusy("attach-canister");
    dispatcher("nnsClose");
  };
</script>

<form on:submit|preventDefault={attach} data-tid="attach-canister-modal">
  <div class="input-wrapper">
    <h5>{$i18n.canisters.enter_canister_id}</h5>
    <PrincipalInput
      bind:validPrincipal
      placeholderLabelKey="canisters.canister_id"
      name="canister-principal"
    />
  </div>

  <button
    data-tid="attach-canister-button"
    class="primary full-width"
    type="submit"
    disabled={validPrincipal === undefined || $busy}
  >
    {$i18n.core.confirm}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  h5 {
    text-align: center;
  }

  form {
    @include modal.section;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .input-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
