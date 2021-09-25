mod payloads;

use candid::candid_method;
use payloads::*;

#[allow(dead_code)]
#[candid_method(update)]
fn bless_replica_version(_: BlessReplicaVersionPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn update_subnet_replica_version(_: UpdateSubnetReplicaVersionPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn update_icp_xdr_conversion_rate(_: UpdateIcpXdrConversionRatePayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn add_node() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn add_node_operator(_: AddNodeOperatorPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn create_subnet(_: CreateSubnetPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn add_nodes_to_subnet(_: AddNodesToSubnetPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn delete_subnet() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn recover_subnet(_: RecoverSubnetPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn remove_nodes_from_subnet() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn remove_nodes(_: RemoveNodesFromSubnetPayload) {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn remove_node_directly() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn update_node_operator_config() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn update_subnet() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn clear_provisional_whitelist() {
    unimplemented!();
}

#[allow(dead_code)]
#[candid_method(update)]
fn set_firewall_config(_: SetFirewallConfigPayload) {
    unimplemented!();
}

fn main() {
    candid::export_service!();
    std::print!("{}", __export_service());
}
