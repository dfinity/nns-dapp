<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import InputWithError from "../ui/InputWithError.svelte";
  import type { Principal } from "@dfinity/principal";
  import { getPrincipalFromString } from "../../utils/accounts.utils";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { attachCanister } from "../../services/canisters.services";
  import { createEventDispatcher } from "svelte";
  import { toastsStore } from "../../stores/toasts.store";

  let address: string = "";
  let validPrincipal: Principal | undefined;
  $: validPrincipal = getPrincipalFromString(address);
  let showError: boolean = false;

  const showErrorIfAny = () => {
    showError = address.length > 0 && validPrincipal === undefined;
  };
  // Hide error on change
  $: address, (showError = false);

  const dispatcher = createEventDispatcher();
  const attach = async () => {
    // Button is only enabled when validPrincipal is defined
    if (validPrincipal !== undefined) {
      startBusy({ initiator: "attach-canister" });
      await attachCanister(validPrincipal);
      toastsStore.success({
        labelKey: "canisters.link_canister_success",
      });
      stopBusy("attach-canister");
      dispatcher("nnsClose");
    }
  };
</script>

<form on:submit|preventDefault={attach} data-tid="attach-canister-modal">
  <div class="input-wrapper">
    <h5>{$i18n.canisters.canister_id}</h5>
    <InputWithError
      inputType="text"
      placeholderLabelKey="canisters.canister_id"
      name="canister-principal"
      bind:value={address}
      theme="dark"
      errorMessage={showError ? $i18n.error.principal_not_valid : undefined}
      on:blur={showErrorIfAny}
    />
  </div>

  <button
    data-tid="attach-canister-button"
    class="primary full-width"
    type="submit"
    disabled={validPrincipal === undefined}
  >
    {$i18n.core.confirm}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

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
