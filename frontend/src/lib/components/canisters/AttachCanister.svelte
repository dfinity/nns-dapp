<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { busy } from "@dfinity/gix-components";
  import { attachCanister } from "$lib/services/canisters.services";
  import { createEventDispatcher } from "svelte";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";

  let principal: Principal | undefined;

  const dispatcher = createEventDispatcher();
  const attach = async () => {
    // Edge case: button is only enabled when principal is defined
    if (principal === undefined) {
      toastsError({
        labelKey: "error.principal_not_valid",
      });
      return;
    }
    startBusy({ initiator: "attach-canister" });
    const { success } = await attachCanister(principal);
    stopBusy("attach-canister");
    if (success) {
      toastsSuccess({
        labelKey: "canisters.link_canister_success",
        substitutions: {
          $canisterId: principal.toText(),
        },
      });
      // Leave modal open if not successful in case the error can be fixed.
      dispatcher("nnsClose");
    }
  };
</script>

<form on:submit|preventDefault={attach} data-tid="attach-canister-modal">
  <PrincipalInput
    bind:principal
    placeholderLabelKey="canisters.canister_id"
    name="canister-principal"
  >
    <svelte:fragment slot="label"
      >{$i18n.canisters.enter_canister_id}</svelte:fragment
    >
  </PrincipalInput>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>
    <button
      data-tid="attach-canister-button"
      class="primary"
      type="submit"
      disabled={principal === undefined || $busy}
    >
      {$i18n.core.confirm}
    </button>
  </div>
</form>
