enum Topic {
  Unspecified,
  NeuronManagement,
  ExchangeRate,
  NetworkEconomics,
  Governance,
  NodeAdmin,
  ParticipantManagement,
  SubnetManagement,
  NetworkCanisterManagement,
  Kyc,
  NodeProviderRewards
}

extension Description on Topic {
  static const _topicNameMap = {
    Topic.Unspecified: "All Topics Except Governance",
    Topic.NeuronManagement: "Manage Neuron",
    Topic.ExchangeRate: "Exchange Rate",
    Topic.NetworkEconomics: "Network Economics",
    Topic.Governance: "Governance",
    Topic.NodeAdmin: "Node Admin",
    Topic.ParticipantManagement: "Participant Management",
    Topic.SubnetManagement: "Subnet Management",
    Topic.NetworkCanisterManagement: "Network Canister Management",
    Topic.Kyc: "Kyc",
    Topic.NodeProviderRewards: "Node Provider Rewards",
  };

  static const _topicDescriptionMap = {
    Topic.Unspecified:
        "Follow neurons on all proposal topics except the governance topic",
    Topic.NeuronManagement:
        "Proposals that manage specific neurons, for example making them perform actions.",
    Topic.ExchangeRate:
        "All proposals that provide “real time” information about the value of ICP, as measured by an IMF SDR, which allows the NNS to convert ICP to cycles (which power computation) at a rate which keeps their real world cost constant.",
    Topic.NetworkEconomics:
        "Proposals that administer network economics, for example, determining what rewards should be paid to node operators.",
    Topic.Governance:
        "All proposals that administer governance, for example to freeze malicious canisters that are harming the network.",
    Topic.NodeAdmin:
        "All proposals that administer node machines somehow, including, but not limited to, upgrading or configuring the OS, upgrading or configuring the virtual machine framework and upgrading or configuring the node replica software.",
    Topic.ParticipantManagement:
        "All proposals that administer network participants, for example, granting and revoking DCIDs (data center identities) or NOIDs (node operator identities).",
    Topic.SubnetManagement:
        "All proposals that administer network subnets, for example creating new subnets, adding and removing subnet nodes, and splitting subnets.",
    Topic.NetworkCanisterManagement:
        "Installing and upgrading “system” canisters that belong to the network. For example, upgrading the NNS. ",
    Topic.Kyc:
        "Proposals that update KYC information for regulatory purposes, for example during the initial Genesis distribution of ICP in the form of neurons.",
    Topic.NodeProviderRewards: "Proposals that reward node providers",
  };

  String get name => _topicNameMap[this]!;
  String get desc => _topicDescriptionMap[this]!;
}
