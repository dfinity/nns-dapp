import { GenesisTokenCanister } from "@dfinity/nns";
import { get } from "svelte/store";
import { HOST } from "../constants/environment.constants";
import type { Secp256k1PublicKey } from "../keys/secp256k1";
import { getLedgerIdentityProxy } from "../proxy/ledger.services.proxy";
import { accountsStore } from "../stores/accounts.store";
import { createAgent } from "../utils/agent.utils";
import { mapNeuronErrorToToastMessage } from "../utils/error.utils";
import { translate } from "../utils/i18n.utils";

const buf2hex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
};

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
      throw new Error(`${hexPubKey} is not a hex string.`);
    }

    if (hexPubKey.length < 130 || hexPubKey.length > 150) {
      throw new Error(
        `The key must be >= 130 characters and <= 150 characters.`
      );
    }
    console.log("Check your wallet to continue");
    const response = await governance.claimNeurons({ hexPubKey });
    console.log(response);
  } catch (error) {
    const toastError = mapNeuronErrorToToastMessage(error);
    const message = translate({ labelKey: toastError.labelKey });
    console.error("Error during claiming neurons");
    console.error(message);
    console.error(error);
  }
};
