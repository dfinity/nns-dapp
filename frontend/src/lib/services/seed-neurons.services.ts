import { HOST } from "$lib/constants/environment.constants";
import type { Secp256k1PublicKey } from "$lib/keys/secp256k1";
import { getLedgerIdentityProxy } from "$lib/proxy/ledger.services.proxy";
import { accountsStore } from "$lib/stores/accounts.store";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { toastsError, toastsShow } from "$lib/stores/toasts.store";
import { createAgent } from "$lib/api/agent.api";
import { mapNeuronErrorToToastMessage } from "$lib/utils/error.utils";
import { translate } from "$lib/utils/i18n.utils";
import { bytesToHexString } from "$lib/utils/utils";
import { GenesisTokenCanister } from "@dfinity/nns";
import { get } from "svelte/store";

const buf2hex = (buffer: ArrayBuffer): string =>
  bytesToHexString([...new Uint8Array(buffer)]);

// TODO: Remove after all seed neurons have been claimed.
// Method to be used only from the Dev Tools console.
// This code is temporary and should be removed.
export const claimSeedNeurons = async () => {
  const accounts = get(accountsStore);
  const hardwareWallet = accounts.hardwareWallets?.[0];
  if (accounts?.main === undefined) {
    alert("Account not yet loaded. Wait a little longer and try again.");
    return;
  }
  if (hardwareWallet === undefined) {
    alert(
      "No hardware wallet linked to this account. Please link your hardware wallet and try again."
    );
    return;
  }
  try {
    startBusy({
      initiator: "claim_seed_neurons",
      labelKey: "busy_screen.pending_approval_hw",
    });
    const identity = await getLedgerIdentityProxy(hardwareWallet?.identifier);
    const governance = GenesisTokenCanister.create({
      agent: await createAgent({ identity, host: HOST }),
    });

    const bufferKey = identity.getPublicKey() as Secp256k1PublicKey;
    const hexPubKey = buf2hex(bufferKey.toRaw());
    const isHex = hexPubKey.match("^[0-9a-fA-F]+$");
    if (!isHex) {
      toastsError({
        labelKey: "error.pub_key_not_hex_string",
        substitutions: {
          $key: hexPubKey,
        },
      });
      return;
    }

    if (hexPubKey.length < 130 || hexPubKey.length > 150) {
      toastsError({
        labelKey: "error.pub_key_hex_string_invalid_length",
      });
      return;
    }
    const ids = await governance.claimNeurons({ hexPubKey });

    toastsShow({
      labelKey: "neurons.claim_seed_neurons_success",
      level: "success",
      substitutions: {
        $neurons: ids.map((id) => id.toString()).join(", "),
      },
    });
  } catch (error: unknown) {
    const toastError = mapNeuronErrorToToastMessage(error);
    toastsShow(toastError);
    const message = translate({ labelKey: toastError.labelKey });
    console.error("Error during claiming neurons");
    console.error(message);
    console.error(error);
  } finally {
    stopBusy("claim_seed_neurons");
  }
};
