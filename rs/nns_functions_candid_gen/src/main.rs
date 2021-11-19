mod payloads;

use candid::candid_method;
use payloads::*;

// 1 - CreateSubnet
#[allow(dead_code)]
#[candid_method(update)]
fn create_subnet(_: CreateSubnetPayload) {
    unimplemented!();
}

// 2 - AddNodeToSubnet
#[allow(dead_code)]
#[candid_method(update)]
fn add_nodes_to_subnet(_: AddNodesToSubnetPayload) {
    unimplemented!();
}

// 3 - NnsCanisterInstall (Skipped due to large payload)

// 4 - NnsCanisterUpgrade (Skipped due to large payload)

// 5 - BlessReplicaVersion
#[allow(dead_code)]
#[candid_method(update)]
fn bless_replica_version(_: BlessReplicaVersionPayload) {
    unimplemented!();
}

// 6 - RecoverSubnet
#[allow(dead_code)]
#[candid_method(update)]
fn recover_subnet(_: RecoverSubnetPayload) {
    unimplemented!();
}

// 7 - UpdateConfigOfSubnet
#[allow(dead_code)]
#[candid_method(update)]
fn update_subnet(_: UpdateSubnetPayload) {
    unimplemented!();
}

// 8 - AssignNoid
#[allow(dead_code)]
#[candid_method(update)]
fn add_node_operator(_: AddNodeOperatorPayload) {
    unimplemented!();
}

// 9 - NnsRootUpgrade (Skipped due to large payload)

// 10 - IcpXdrConversionRate
#[allow(dead_code)]
#[candid_method(update)]
fn update_icp_xdr_conversion_rate(_: UpdateIcpXdrConversionRatePayload) {
    unimplemented!();
}

// 11 - UpdateSubnetReplicaVersion
#[allow(dead_code)]
#[candid_method(update)]
fn update_subnet_replica_version(_: UpdateSubnetReplicaVersionPayload) {
    unimplemented!();
}

// 12 - ClearProvisionalWhitelist
#[allow(dead_code)]
#[candid_method(update)]
fn clear_provisional_whitelist() {
    unimplemented!();
}

// 13 - RemoveNodesFromSubnet
#[allow(dead_code)]
#[candid_method(update)]
fn remove_nodes_from_subnet(_: RemoveNodesFromSubnetPayload) {
    unimplemented!();
}

// 14 - SetAuthorizedSubnetworks
#[allow(dead_code)]
#[candid_method(update)]
fn set_authorized_subnetwork_list(_: SetAuthorizedSubnetworkListArgs) {
    unimplemented!();
}

// 15 - SetFirewallConfig
#[allow(dead_code)]
#[candid_method(update)]
fn set_firewall_config(_: SetFirewallConfigPayload) {
    unimplemented!();
}

// 16 - UpdateNodeOperatorConfig
#[allow(dead_code)]
#[candid_method(update)]
fn update_node_operator_config(_: UpdateNodeOperatorConfigPayload) {
    unimplemented!();
}

// 17 - StopOrStartNnsCanister
#[allow(dead_code)]
#[candid_method(update)]
fn stop_or_start_nns_canister(_: StopOrStartNnsCanisterProposalPayload) {
    unimplemented!();
}

// 18 - RemoveNodes
#[allow(dead_code)]
#[candid_method(update)]
fn remove_nodes(_: RemoveNodesFromSubnetPayload) {
    unimplemented!();
}

// 19 - UninstallCode (Skipped because there is no payload)

// 20 - UpdateNodeRewardsTable
#[allow(dead_code)]
#[candid_method(update)]
fn update_node_rewards_table(_: UpdateNodeRewardsTableProposalPayload) {
    unimplemented!();
}

// 21 - AddOrRemoveDataCenters
#[allow(dead_code)]
#[candid_method(update)]
fn add_or_remove_data_centers(_: AddOrRemoveDataCentersProposalPayload) {
    unimplemented!();
}

// 22 - UpdateUnassignedNodesConfig
#[allow(dead_code)]
#[candid_method(update)]
fn update_unassigned_nodes_config(_: UpdateUnassignedNodesConfigPayload) {
    unimplemented!();
}

fn main() {
    candid::export_service!();
    std::print!("{}", __export_service());
}
