import { Principal } from "@dfinity/principal";
import type { SnsAction } from "@dfinity/sns";

const motionProposal1 = {
  url: "internet-computer.org",
  title: "Dummy Motion Proposal",
  summary: "# Summary\nThis is a dummy *motion* proposal.",
  action: [
    {
      Motion: { motion_text: "This is a dummy motion." },
    },
  ] as [SnsAction],
};

const motionProposal2 = {
  url: "internet-computer.org",
  title: "Dummy Motion Proposal 2",
  summary: "# Summary\nThis is a second dummy *motion* proposal.",
  action: [
    {
      Motion: { motion_text: "This is the second dummy motion." },
    },
  ] as [SnsAction],
};

const manageSnsMetadataproposal = {
  url: "internet-computer.org",
  title: "Dummy Metadata Proposal",
  summary: "# Summary\nThis is a dummy *metadata* proposal.",
  action: [
    {
      ManageSnsMetadata: {
        url: [],
        logo: [],
        name: [],
        description: ["Description changed by proposal"],
      },
    },
  ] as [SnsAction],
};

const nsFunctionProposal1 = {
  url: "internet-computer.org",
  title: "Dummy NS Function Proposal",
  summary: "# Summary\nThis is a dummy *NS function* proposal.",
  action: [
    {
      AddGenericNervousSystemFunction: {
        id: BigInt(1002),
        name: "Dummy System Function",
        description: ["This is a dummy system function."],
        function_type: [
          {
            GenericNervousSystemFunction: {
              validator_canister_id: [
                Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai"),
              ],
              target_canister_id: [
                Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai"),
              ],
              validator_method_name: ["test"],
              target_method_name: ["test"],
            },
          },
        ],
      },
    },
  ] as [SnsAction],
};

const nsFunctionProposal2 = {
  url: "internet-computer.org",
  title: "Dummy NS Function Proposal 2",
  summary: "# Summary\nThis is a second dummy *NS function* proposal.",
  action: [
    {
      AddGenericNervousSystemFunction: {
        id: BigInt(1003),
        name: "Dummy System Function 2",
        description: ["This is the second dummy system function."],
        function_type: [
          {
            GenericNervousSystemFunction: {
              validator_canister_id: [
                Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai"),
              ],
              target_canister_id: [
                Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai"),
              ],
              validator_method_name: ["test"],
              target_method_name: ["test"],
            },
          },
        ],
      },
    },
  ] as [SnsAction],
};

// We need to pass a proposal to add a function to the nervous system first
const executeNSFunctionProposal = {
  url: "internet-computer.org",
  title: "Execute Generic Nervoys system Function",
  summary:
    "# Summary\nThis is a dummy proposal to execute a *nervous system function*.",
  action: [
    {
      ExecuteGenericNervousSystemFunction: {
        function_id: BigInt(1002),
        payload: new Uint8Array(),
      },
    },
  ] as [SnsAction],
};

// We need to pass a proposal to add a function to the nervous system first
// const removeNSFunctionProposal = {
//   url: "internet-computer.org",
//   title: "Remove Generic Nervoys system Function",
//   summary:
//     "# Summary\nThis is a dummy proposal to remove a *nervous system function*.",
//   action: [
//     {
//       RemoveGenericNervousSystemFunction: BigInt(1002),
//     },
//   ] as [SnsAction],
// };

// We need to deploy new version of the SNS canisters first.
// const upgradeProposal = {
//   url: "internet-computer.org",
//   title: "Upgrade to next version",
//   summary:
//     "# Summary\nThis is a dummy proposal to *upgrade* to the next version.",
//   action: [
//     {
//       UpgradeSnsToNextVersion: {},
//     },
//   ] as [SnsAction],
// };

const registerDappCanisterProposal = {
  url: "internet-computer.org",
  title: "Register Dapp Canister",
  summary:
    "# Summary\nThis is a dummy proposal to register a new dapp canister.",
  action: [
    {
      RegisterDappCanisters: {
        canister_ids: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
      },
    },
  ] as [SnsAction],
};

const transferFundsProposal = {
  url: "internet-computer.org",
  title: "Transfer tokens",
  summary: "# Summary\nThis is a dummy proposal to *transfer* funds.",
  action: [
    {
      TransferSnsTreasuryFunds: {
        from_treasury: 1,
        to_principal: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
        to_subaccount: [],
        memo: [BigInt(33333)],
        amount_e8s: BigInt(100_000_000_000),
      },
    },
  ] as [SnsAction],
};

// TODO: Find a valid new_canister_wasm
// const upgradeControlledCanisterProposal = {
//   url: "internet-computer.org",
//   title: "Upgrade canister",
//   summary: "# Summary\nThis is a dummy proposal to *upgrade* a canister.",
//   action: [
//     {
//       UpgradeSnsControlledCanister: {
//         new_canister_wasm: new Uint8Array(),
//         canister_id: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
//         canister_upgrade_arg: [],
//       },
//     },
//   ] as [SnsAction],
// };

const deregisterCanisterProposal = {
  url: "internet-computer.org",
  title: "Deregister canister",
  summary:
    "# Summary\nThis is a dummy proposal to *deregister* a controlled canister.",
  action: [
    {
      DeregisterDappCanisters: {
        canister_ids: [Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")],
        new_controllers: [
          Principal.fromText(
            "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
          ),
        ],
      },
    },
  ] as [SnsAction],
};

export const snsProposals = [
  motionProposal1,
  motionProposal2,
  manageSnsMetadataproposal,
  nsFunctionProposal1,
  nsFunctionProposal2,
  // The following proposals require specific state to be set up first.
  executeNSFunctionProposal,
  // removeNSFunctionProposal,
  // upgradeProposal,
  // upgradeControlledCanisterProposal,
  registerDappCanisterProposal,
  transferFundsProposal,
  deregisterCanisterProposal,
];
