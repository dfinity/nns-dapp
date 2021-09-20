enum NnsFunction {
  // This exists because proto3 defaults to the 0 value on enums.
  NNS_FUNCTION_UNSPECIFIED,
// Combine a specified set of nodes, typically drawn from data centers and
// operators in such a way as to guarantee their independence, into a new
// decentralized subnet.
// The execution of this NNS function first initiates a new instance of
// the distributed key generation protocol. The transcript of that protocol
// is written to a new subnet record in the registry, together with initial
// configuration information for the subnet, from where the nodes comprising
// the subnet pick it up.
  NNS_FUNCTION_CREATE_SUBNET,
// Add a new node to a subnet. The node cannot be currently assigned to a
// subnet.
// The execution of this proposal changes an existing subnet record to add
// a node. From the perspective of the NNS, this update is a simple update
// of the subnet record in the registry.
  NNS_FUNCTION_ADD_NODE_TO_SUBNET,
// A proposal to add a new canister to be installed and executed in the
// NNS subnetwork.
// The root canister, which controls all canisters on the NNS except for
// itself, handles this proposal type. The call also expects the Wasm module
// that shall be installed.
  NNS_FUNCTION_NNS_CANISTER_INSTALL,
// A proposal to upgrade an existing canister in the NNS subnetwork.
// This proposal type is executed by the root canister. Beyond upgrading
// the Wasm module of the target canister, the proposal can also set the
// authorization information and the allocations.
  NNS_FUNCTION_NNS_CANISTER_UPGRADE,
// A proposal to bless a new version to which the replicas can be
// upgraded.
// The proposal registers a replica version (identified by the hash of the
// installation image) in the registry. Besides creating a record for that
// version, the proposal also appends that version to the list of "blessed
// versions" that can be installed on a subnet. By itself, this proposal
// does not effect any upgrade.
  NNS_FUNCTION_BLESS_REPLICA_VERSION,
// Update a subnet's recovery CUP (used to recover subnets that have stalled).
// Nodes that find a recovery CUP for their subnet will load that CUP from
// the registry and restart the replica from that CUP.
  NNS_FUNCTION_RECOVER_SUBNET,
// Update a subnet's configuration.
// This proposal updates the subnet record in the registry, with the changes
// being picked up by the nodes on the subnet when they reference the
// respective registry version. Subnet configuration comprises protocol
// parameters that must be consistent across the subnet (e.g. message sizes).
  NNS_FUNCTION_UPDATE_CONFIG_OF_SUBNET,
// Assign an identity to a node operator, such as a funding partner,
// associating key information regarding its ownership, the jurisdiction
// in which it is located, and other information.
// The node operator is stored as a record in the registry. It contains
// the remaining node allowance for that node operator, that is the number
// of nodes the node operator can still add to the IC. When an additional
// node is added by the node operator, the remaining allowance is decreased.
  NNS_FUNCTION_ASSIGN_NOID,
// A proposal to upgrade the root canister in the NNS subnetwork.
// The proposal is processed by the Lifeline canister, which controls the
// root canister. The proposal updates the Wasm module as well as the
// authorization settings.
  NNS_FUNCTION_NNS_ROOT_UPGRADE,
// Update the ICP/XDR conversion rate.
// Changes the ICP-to-XDR conversion rate in the governance canister. This
// setting affects cycles pricing (as the value of cycles shall be constant
// with respect to IMF SDRs) as well as the rewards paid for nodes, which
// are expected to be specified in terms of IMF SDRs as well.
  NNS_FUNCTION_ICP_XDR_CONVERSION_RATE,
// Update the replica version running on a given subnet.
// The proposal changes the replica version that is used on the specified
// subnet. The version must be contained in the list of blessed replica
// versions. The upgrade is performed when the subnet creates the next
// regular CUP.
  NNS_FUNCTION_UPDATE_SUBNET_REPLICA_VERSION,

  /// Clear the provisional whitelist.
  /// The proposal changes the provisional whitelist to the empty list.
  NNS_FUNCTION_CLEAR_PROVISIONAL_WHITELIST,
// Removes a node from a subnet. The node must be currently assigned to a
// subnet.
// The execution of this proposal changes an existing subnet record to remove
// a node. From the perspective of the NNS, this update is a simple update
// of the subnet record in the registry.
  NNS_FUNCTION_REMOVE_NODES_FROM_SUBNET,
// Informs the cycles minting canister that a certain principal is
// authorized to use certain subnetworks (from a list). Can also be
// used to set the "default" list of subnetworks that principals
// without special authorization are allowed to use.
  NNS_FUNCTION_SET_AUTHORIZED_SUBNETWORKS,
// Change the Firewall configuration in the registry.
  NNS_FUNCTION_SET_FIREWALL_CONFIG,
// Change a Node Operator's allowance in the registry.
  NNS_FUNCTION_UPDATE_NODE_OPERATOR_CONFIG,
// Stop or start an NNS canister.
  NNS_FUNCTION_STOP_OR_START_NNS_CANISTER,
// Remove unassigned nodes from the registry.
  NNS_FUNCTION_REMOVE_NODES,
// Uninstall code of a canister.
  NNS_FUNCTION_UNINSTALL_CODE,
}
