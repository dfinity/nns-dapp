import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";

export const mockNamedAddress: NamedAddress = {
  name: "Alice",
  address: {
    Icp: "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
  },
};

export const mockNamedAddressIcrc1: NamedAddress = {
  name: "Bob",
  address: {
    Icrc1: "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe",
  },
};
