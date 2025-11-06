import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { isNullish } from "@dfinity/utils";

/**
 * Helper function to extract address string from AddressType
 */
export const getAddressString = (
  addressType?: NamedAddress["address"]
): string => {
  if (isNullish(addressType)) {
    return "";
  }

  if ("Icp" in addressType) {
    return addressType.Icp;
  }

  if ("Icrc1" in addressType) {
    return addressType.Icrc1;
  }

  return "";
};
