import { GenesisTokenCanister } from "@dfinity/nns";
import { get } from "svelte/store";
import { HOST } from "../constants/environment.constants";
import type { Secp256k1PublicKey } from "../keys/secp256k1";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import { accountsStore } from "../stores/accounts.store";
import { toastsStore } from "../stores/toasts.store";
import { createAgent } from "../utils/agent.utils";
import { mapNeuronErrorToToastMessage } from "../utils/error.utils";
import { translate } from "../utils/i18n.utils";
import { bytesToHexString } from "../utils/utils";

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
    const identity = await getLedgerIdentityProxy(hardwareWallet?.identifier);
    const governance = await GenesisTokenCanister.create({
      agent: await createAgent({ identity, host: HOST }),
    });

    const bufferKey = identity.getPublicKey() as Secp256k1PublicKey;
    const hexPubKey = buf2hex(bufferKey.toRaw());
    const isHex = hexPubKey.match("^[0-9a-fA-F]+$");
    if (!isHex) {
      toastsStore.error({
        labelKey: "error.pub_key_not_hex_string",
        substitutions: {
          $key: hexPubKey,
        },
      });
      return;
    }

    if (hexPubKey.length < 130 || hexPubKey.length > 150) {
      toastsStore.error({
        labelKey: "error.pub_key_hex_string_invalid_length",
      });
      return;
    }
    return await governance.claimNeurons({ hexPubKey });
  } catch (error) {
    const toastError = mapNeuronErrorToToastMessage(error);
    toastsStore.error(toastError);
    const message = translate({ labelKey: toastError.labelKey });
    console.error("Error during claiming neurons");
    console.error(message);
    console.error(error);
  }
};
