<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    WizardModal,
    type WizardStep,
    type WizardSteps,
  } from "@dfinity/gix-components";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { attachCanister } from "$lib/services/canisters.services";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";

  const steps: WizardSteps = [
    {
      name: "EnterCanisterId",
      title: $i18n.canisters.link_canister,
    },
  ];

  let currentStep: WizardStep | undefined;
  let modal: WizardModal;

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
    startBusy({ initiator: "link-canister" });
    const { success } = await attachCanister(principal);
    stopBusy("link-canister");
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

<WizardModal {steps} bind:currentStep bind:this={modal} on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{currentStep?.title ?? $i18n.canisters.link_canister}</span
    ></svelte:fragment
  >

  {#if currentStep?.name === "EnterCanisterId"}
    <AddPrincipal bind:principal on:nnsSelectPrincipal={attach} on:nnsClose>
      <span slot="title">{$i18n.canisters.enter_canister_id}</span>
      <span slot="button">{$i18n.core.confirm}</span>
    </AddPrincipal>
  {/if}
</WizardModal>
