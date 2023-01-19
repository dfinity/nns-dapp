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

export const snsProposals = [
  motionProposal1,
  motionProposal2,
  manageSnsMetadataproposal,
  nsFunctionProposal1,
  nsFunctionProposal2,
];
