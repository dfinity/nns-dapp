import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { ICPToken, isNullish, type Token } from "@dfinity/utils";

/**
 * Helper function to extract address string from AddressType
 */
export const getAddressString = (
  addressType?: NamedAddress["address"]
): string => {
  if (isNullish(addressType)) {
    return "";
  }

  if (isIcpAddress(addressType)) {
    return addressType.Icp;
  }

  if (isIcrc1Address(addressType)) {
    return addressType.Icrc1;
  }

  return "";
};

/**
 * Helper function to check if an address is an ICP address
 */
export const isIcpAddress = (
  address: NamedAddress["address"]
): address is { Icp: string } => {
  return "Icp" in address;
};

/**
 * Helper function to check if an address is an ICRC1 address
 */
export const isIcrc1Address = (
  address: NamedAddress["address"]
): address is { Icrc1: string } => {
  return "Icrc1" in address;
};

/**
 * Helper function to check if a token is ICP
 */
export const isIcpToken = (token: Token): boolean => {
  return token.symbol === ICPToken.symbol;
};

/**
 * Filters address book entries based on the token type
 * - For ICP transactions: returns both ICP and ICRC1 addresses
 * - For non-ICP transactions: returns only ICRC1 addresses
 */
export const filterAddressesByToken = ({
  addresses,
  token,
}: {
  addresses: NamedAddress[];
  token: Token;
}): NamedAddress[] => {
  const isIcp = isIcpToken(token);

  // For ICP transactions, include both ICP and ICRC1 addresses
  if (isIcp) return addresses;

  // For non-ICP transactions, include only ICRC1 addresses
  return addresses.filter((namedAddress) =>
    isIcrc1Address(namedAddress.address)
  );
};
