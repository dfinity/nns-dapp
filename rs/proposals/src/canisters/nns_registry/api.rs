//! Rust code created from candid by: `scripts/did2rs.sh --canister nns_registry --out api.rs --header did2rs.header --traits Serialize`
//! Candid for canister `nns_registry` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2024-10-23_03-07-ubuntu20.04/rs/registry/canister/canister/registry.did>
#![allow(clippy::all)]
#![allow(missing_docs)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult;
use serde::Serialize;

#[derive(Serialize, CandidType, Deserialize)]
pub struct EmptyRecord {}
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Deserialize, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, CandidType, Deserialize)]
pub struct AddApiBoundaryNodesPayload {
    pub version: String,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum FirewallRulesScope {
    Node(Principal),
    ReplicaNodes,
    ApiBoundaryNodes,
    Subnet(Principal),
    Global,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct FirewallRule {
    pub ipv4_prefixes: Vec<String>,
    pub direction: Option<i32>,
    pub action: i32,
    pub user: Option<String>,
    pub comment: String,
    pub ipv6_prefixes: Vec<String>,
    pub ports: Vec<u32>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddFirewallRulesPayload {
    pub expected_hash: String,
    pub scope: FirewallRulesScope,
    pub positions: Vec<i32>,
    pub rules: Vec<FirewallRule>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct IPv4Config {
    pub prefix_length: u32,
    pub gateway_ip_addr: String,
    pub ip_addr: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddNodePayload {
    pub prometheus_metrics_endpoint: String,
    pub http_endpoint: String,
    pub idkg_dealing_encryption_pk: Option<serde_bytes::ByteBuf>,
    pub domain: Option<String>,
    pub public_ipv4_config: Option<IPv4Config>,
    pub xnet_endpoint: String,
    pub chip_id: Option<serde_bytes::ByteBuf>,
    pub committee_signing_pk: serde_bytes::ByteBuf,
    pub node_reward_type: Option<String>,
    pub node_signing_pk: serde_bytes::ByteBuf,
    pub transport_tls_cert: serde_bytes::ByteBuf,
    pub ni_dkg_dealing_encryption_pk: serde_bytes::ByteBuf,
    pub p2p_flow_endpoints: Vec<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddNodeOperatorPayload {
    pub ipv6: Option<String>,
    pub node_operator_principal_id: Option<Principal>,
    pub node_allowance: u64,
    pub rewardable_nodes: Vec<(String, u32)>,
    pub node_provider_principal_id: Option<Principal>,
    pub dc_id: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddNodesToSubnetPayload {
    pub subnet_id: Principal,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct Gps {
    pub latitude: f32,
    pub longitude: f32,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct DataCenterRecord {
    pub id: String,
    pub gps: Option<Gps>,
    pub region: String,
    pub owner: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddOrRemoveDataCentersProposalPayload {
    pub data_centers_to_add: Vec<DataCenterRecord>,
    pub data_centers_to_remove: Vec<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct ChangeSubnetMembershipPayload {
    pub node_ids_add: Vec<Principal>,
    pub subnet_id: Principal,
    pub node_ids_remove: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct CanisterIdRange {
    pub end: Principal,
    pub start: Principal,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct CompleteCanisterMigrationPayload {
    pub canister_id_ranges: Vec<CanisterIdRange>,
    pub migration_trace: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct SubnetFeatures {
    pub canister_sandboxing: bool,
    pub http_requests: bool,
    pub sev_enabled: Option<bool>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum EcdsaCurve {
    #[serde(rename = "secp256k1")]
    Secp256K1,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct EcdsaKeyId {
    pub name: String,
    pub curve: EcdsaCurve,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct EcdsaKeyRequest {
    pub key_id: EcdsaKeyId,
    pub subnet_id: Option<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct EcdsaInitialConfig {
    pub quadruples_to_create_in_advance: u32,
    pub max_queue_size: Option<u32>,
    pub keys: Vec<EcdsaKeyRequest>,
    pub signature_request_timeout_ns: Option<u64>,
    pub idkg_key_rotation_period_ms: Option<u64>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum SchnorrAlgorithm {
    #[serde(rename = "ed25519")]
    Ed25519,
    #[serde(rename = "bip340secp256k1")]
    Bip340Secp256K1,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct SchnorrKeyId {
    pub algorithm: SchnorrAlgorithm,
    pub name: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum MasterPublicKeyId {
    Schnorr(SchnorrKeyId),
    Ecdsa(EcdsaKeyId),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct KeyConfig {
    pub max_queue_size: Option<u32>,
    pub key_id: Option<MasterPublicKeyId>,
    pub pre_signatures_to_create_in_advance: Option<u32>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct KeyConfigRequest {
    pub subnet_id: Option<Principal>,
    pub key_config: Option<KeyConfig>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct InitialChainKeyConfig {
    pub signature_request_timeout_ns: Option<u64>,
    pub key_configs: Vec<KeyConfigRequest>,
    pub idkg_key_rotation_period_ms: Option<u64>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum SubnetType {
    #[serde(rename = "application")]
    Application,
    #[serde(rename = "verified_application")]
    VerifiedApplication,
    #[serde(rename = "system")]
    System,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct CreateSubnetPayload {
    pub unit_delay_millis: u64,
    pub features: SubnetFeatures,
    pub gossip_registry_poll_period_ms: u32,
    pub max_ingress_bytes_per_message: u64,
    pub dkg_dealings_per_block: u64,
    pub max_block_payload_size: u64,
    pub start_as_nns: bool,
    pub is_halted: bool,
    pub gossip_pfn_evaluation_period_ms: u32,
    pub max_ingress_messages_per_block: u64,
    pub max_number_of_canisters: u64,
    pub ecdsa_config: Option<EcdsaInitialConfig>,
    pub gossip_max_artifact_streams_per_peer: u32,
    pub replica_version_id: String,
    pub gossip_max_duplicity: u32,
    pub gossip_max_chunk_wait_ms: u32,
    pub dkg_interval_length: u64,
    pub subnet_id_override: Option<Principal>,
    pub ssh_backup_access: Vec<String>,
    pub ingress_bytes_per_block_soft_cap: u64,
    pub initial_notary_delay_millis: u64,
    pub chain_key_config: Option<InitialChainKeyConfig>,
    pub gossip_max_chunk_size: u32,
    pub subnet_type: SubnetType,
    pub ssh_readonly_access: Vec<String>,
    pub gossip_retransmission_request_ms: u32,
    pub gossip_receive_check_cache_size: u32,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct DeployGuestosToAllSubnetNodesPayload {
    pub subnet_id: Principal,
    pub replica_version_id: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct DeployGuestosToAllUnassignedNodesPayload {
    pub elected_replica_version: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct DeployGuestosToSomeApiBoundaryNodes {
    pub version: String,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct DeployHostosToSomeNodes {
    pub hostos_version_id: Option<String>,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct GetApiBoundaryNodeIdsRequest {}
#[derive(Serialize, CandidType, Deserialize)]
pub struct ApiBoundaryNodeIdRecord {
    pub id: Option<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum GetApiBoundaryNodeIdsResponse {
    Ok(Vec<ApiBoundaryNodeIdRecord>),
    Err(String),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct NodeOperatorRecord {
    pub ipv6: Option<String>,
    pub node_operator_principal_id: serde_bytes::ByteBuf,
    pub node_allowance: u64,
    pub rewardable_nodes: Vec<(String, u32)>,
    pub node_provider_principal_id: serde_bytes::ByteBuf,
    pub dc_id: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum GetNodeOperatorsAndDcsOfNodeProviderResponse {
    Ok(Vec<(DataCenterRecord, NodeOperatorRecord)>),
    Err(String),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct NodeProvidersMonthlyXdrRewards {
    pub registry_version: Option<u64>,
    pub rewards: Vec<(String, u64)>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum GetNodeProvidersMonthlyXdrRewardsResponse {
    Ok(NodeProvidersMonthlyXdrRewards),
    Err(String),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct GetSubnetForCanisterRequest {
    pub principal: Option<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum GetSubnetForCanisterResponse {
    Ok { subnet_id: Option<Principal> },
    Err(String),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct PrepareCanisterMigrationPayload {
    pub canister_id_ranges: Vec<CanisterIdRange>,
    pub source_subnet: Principal,
    pub destination_subnet: Principal,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RecoverSubnetPayload {
    pub height: u64,
    pub replacement_nodes: Option<Vec<Principal>>,
    pub subnet_id: Principal,
    pub registry_store_uri: Option<(String, String, u64)>,
    pub ecdsa_config: Option<EcdsaInitialConfig>,
    pub state_hash: serde_bytes::ByteBuf,
    pub chain_key_config: Option<InitialChainKeyConfig>,
    pub time_ns: u64,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RemoveApiBoundaryNodesPayload {
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RemoveFirewallRulesPayload {
    pub expected_hash: String,
    pub scope: FirewallRulesScope,
    pub positions: Vec<i32>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RemoveNodeDirectlyPayload {
    pub node_id: Principal,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RemoveNodeOperatorsPayload {
    pub node_operators_to_remove: Vec<serde_bytes::ByteBuf>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RemoveNodesPayload {
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct RerouteCanisterRangesPayload {
    pub source_subnet: Principal,
    pub reassigned_canister_ranges: Vec<CanisterIdRange>,
    pub destination_subnet: Principal,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct ReviseElectedGuestosVersionsPayload {
    pub release_package_urls: Vec<String>,
    pub replica_versions_to_unelect: Vec<String>,
    pub replica_version_to_elect: Option<String>,
    pub guest_launch_measurement_sha256_hex: Option<String>,
    pub release_package_sha256_hex: Option<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct ReviseElectedHostosVersionsPayload {
    pub release_package_urls: Vec<String>,
    pub hostos_version_to_elect: Option<String>,
    pub hostos_versions_to_unelect: Vec<String>,
    pub release_package_sha256_hex: Option<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct SetFirewallConfigPayload {
    pub ipv4_prefixes: Vec<String>,
    pub firewall_config: String,
    pub ipv6_prefixes: Vec<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateApiBoundaryNodesVersionPayload {
    pub version: String,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateElectedHostosVersionsPayload {
    pub release_package_urls: Vec<String>,
    pub hostos_version_to_elect: Option<String>,
    pub hostos_versions_to_unelect: Vec<String>,
    pub release_package_sha256_hex: Option<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateFirewallRulesPayload {
    pub expected_hash: String,
    pub scope: FirewallRulesScope,
    pub positions: Vec<i32>,
    pub rules: Vec<FirewallRule>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeDirectlyPayload {
    pub idkg_dealing_encryption_pk: Option<serde_bytes::ByteBuf>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeDomainDirectlyPayload {
    pub node_id: Principal,
    pub domain: Option<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum UpdateNodeDomainDirectlyResponse {
    Ok,
    Err(String),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeIPv4ConfigDirectlyPayload {
    pub ipv4_config: Option<IPv4Config>,
    pub node_id: Principal,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum UpdateNodeIpv4ConfigDirectlyResponse {
    Ok,
    Err(String),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeOperatorConfigPayload {
    pub node_operator_id: Option<Principal>,
    pub set_ipv6_to_none: Option<bool>,
    pub ipv6: Option<String>,
    pub node_provider_id: Option<Principal>,
    pub node_allowance: Option<u64>,
    pub rewardable_nodes: Vec<(String, u32)>,
    pub dc_id: Option<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeOperatorConfigDirectlyPayload {
    pub node_operator_id: Option<Principal>,
    pub node_provider_id: Option<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct NodeRewardRate {
    pub xdr_permyriad_per_node_per_month: u64,
    pub reward_coefficient_percent: Option<i32>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct NodeRewardRates {
    pub rates: Vec<(String, NodeRewardRate)>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodeRewardsTableProposalPayload {
    pub new_entries: Vec<(String, NodeRewardRates)>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateNodesHostosVersionPayload {
    pub hostos_version_id: Option<String>,
    pub node_ids: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateSshReadOnlyAccessForAllUnassignedNodesPayload {
    pub ssh_readonly_keys: Vec<String>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct EcdsaConfig {
    pub quadruples_to_create_in_advance: u32,
    pub max_queue_size: Option<u32>,
    pub key_ids: Vec<EcdsaKeyId>,
    pub signature_request_timeout_ns: Option<u64>,
    pub idkg_key_rotation_period_ms: Option<u64>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct ChainKeyConfig {
    pub signature_request_timeout_ns: Option<u64>,
    pub key_configs: Vec<KeyConfig>,
    pub idkg_key_rotation_period_ms: Option<u64>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateSubnetPayload {
    pub unit_delay_millis: Option<u64>,
    pub max_duplicity: Option<u32>,
    pub features: Option<SubnetFeatures>,
    pub set_gossip_config_to_default: bool,
    pub halt_at_cup_height: Option<bool>,
    pub pfn_evaluation_period_ms: Option<u32>,
    pub subnet_id: Principal,
    pub max_ingress_bytes_per_message: Option<u64>,
    pub dkg_dealings_per_block: Option<u64>,
    pub ecdsa_key_signing_disable: Option<Vec<EcdsaKeyId>>,
    pub max_block_payload_size: Option<u64>,
    pub start_as_nns: Option<bool>,
    pub is_halted: Option<bool>,
    pub chain_key_signing_enable: Option<Vec<MasterPublicKeyId>>,
    pub max_ingress_messages_per_block: Option<u64>,
    pub max_number_of_canisters: Option<u64>,
    pub ecdsa_config: Option<EcdsaConfig>,
    pub retransmission_request_ms: Option<u32>,
    pub dkg_interval_length: Option<u64>,
    pub registry_poll_period_ms: Option<u32>,
    pub max_chunk_wait_ms: Option<u32>,
    pub receive_check_cache_size: Option<u32>,
    pub ecdsa_key_signing_enable: Option<Vec<EcdsaKeyId>>,
    pub ssh_backup_access: Option<Vec<String>>,
    pub max_chunk_size: Option<u32>,
    pub initial_notary_delay_millis: Option<u64>,
    pub chain_key_config: Option<ChainKeyConfig>,
    pub max_artifact_streams_per_peer: Option<u32>,
    pub subnet_type: Option<SubnetType>,
    pub ssh_readonly_access: Option<Vec<String>>,
    pub chain_key_signing_disable: Option<Vec<MasterPublicKeyId>>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateUnassignedNodesConfigPayload {
    pub replica_version: Option<String>,
    pub ssh_readonly_access: Option<Vec<String>>,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn add_api_boundary_nodes(&self, arg0: AddApiBoundaryNodesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "add_api_boundary_nodes", (arg0,)).await
    }
    pub async fn add_firewall_rules(&self, arg0: AddFirewallRulesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "add_firewall_rules", (arg0,)).await
    }
    pub async fn add_node(&self, arg0: AddNodePayload) -> CallResult<(Principal,)> {
        ic_cdk::call(self.0, "add_node", (arg0,)).await
    }
    pub async fn add_node_operator(&self, arg0: AddNodeOperatorPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "add_node_operator", (arg0,)).await
    }
    pub async fn add_nodes_to_subnet(&self, arg0: AddNodesToSubnetPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "add_nodes_to_subnet", (arg0,)).await
    }
    pub async fn add_or_remove_data_centers(&self, arg0: AddOrRemoveDataCentersProposalPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "add_or_remove_data_centers", (arg0,)).await
    }
    pub async fn change_subnet_membership(&self, arg0: ChangeSubnetMembershipPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "change_subnet_membership", (arg0,)).await
    }
    pub async fn clear_provisional_whitelist(&self) -> CallResult<()> {
        ic_cdk::call(self.0, "clear_provisional_whitelist", ()).await
    }
    pub async fn complete_canister_migration(&self, arg0: CompleteCanisterMigrationPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "complete_canister_migration", (arg0,)).await
    }
    pub async fn create_subnet(&self, arg0: CreateSubnetPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "create_subnet", (arg0,)).await
    }
    pub async fn deploy_guestos_to_all_subnet_nodes(
        &self,
        arg0: DeployGuestosToAllSubnetNodesPayload,
    ) -> CallResult<()> {
        ic_cdk::call(self.0, "deploy_guestos_to_all_subnet_nodes", (arg0,)).await
    }
    pub async fn deploy_guestos_to_all_unassigned_nodes(
        &self,
        arg0: DeployGuestosToAllUnassignedNodesPayload,
    ) -> CallResult<()> {
        ic_cdk::call(self.0, "deploy_guestos_to_all_unassigned_nodes", (arg0,)).await
    }
    pub async fn deploy_guestos_to_some_api_boundary_nodes(
        &self,
        arg0: DeployGuestosToSomeApiBoundaryNodes,
    ) -> CallResult<()> {
        ic_cdk::call(self.0, "deploy_guestos_to_some_api_boundary_nodes", (arg0,)).await
    }
    pub async fn deploy_hostos_to_some_nodes(&self, arg0: DeployHostosToSomeNodes) -> CallResult<()> {
        ic_cdk::call(self.0, "deploy_hostos_to_some_nodes", (arg0,)).await
    }
    pub async fn get_api_boundary_node_ids(
        &self,
        arg0: GetApiBoundaryNodeIdsRequest,
    ) -> CallResult<(GetApiBoundaryNodeIdsResponse,)> {
        ic_cdk::call(self.0, "get_api_boundary_node_ids", (arg0,)).await
    }
    pub async fn get_build_metadata(&self) -> CallResult<(String,)> {
        ic_cdk::call(self.0, "get_build_metadata", ()).await
    }
    pub async fn get_node_operators_and_dcs_of_node_provider(
        &self,
        arg0: Principal,
    ) -> CallResult<(GetNodeOperatorsAndDcsOfNodeProviderResponse,)> {
        ic_cdk::call(self.0, "get_node_operators_and_dcs_of_node_provider", (arg0,)).await
    }
    pub async fn get_node_providers_monthly_xdr_rewards(
        &self,
    ) -> CallResult<(GetNodeProvidersMonthlyXdrRewardsResponse,)> {
        ic_cdk::call(self.0, "get_node_providers_monthly_xdr_rewards", ()).await
    }
    pub async fn get_subnet_for_canister(
        &self,
        arg0: GetSubnetForCanisterRequest,
    ) -> CallResult<(GetSubnetForCanisterResponse,)> {
        ic_cdk::call(self.0, "get_subnet_for_canister", (arg0,)).await
    }
    pub async fn prepare_canister_migration(&self, arg0: PrepareCanisterMigrationPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "prepare_canister_migration", (arg0,)).await
    }
    pub async fn recover_subnet(&self, arg0: RecoverSubnetPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "recover_subnet", (arg0,)).await
    }
    pub async fn remove_api_boundary_nodes(&self, arg0: RemoveApiBoundaryNodesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "remove_api_boundary_nodes", (arg0,)).await
    }
    pub async fn remove_firewall_rules(&self, arg0: RemoveFirewallRulesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "remove_firewall_rules", (arg0,)).await
    }
    pub async fn remove_node_directly(&self, arg0: RemoveNodeDirectlyPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "remove_node_directly", (arg0,)).await
    }
    pub async fn remove_node_operators(&self, arg0: RemoveNodeOperatorsPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "remove_node_operators", (arg0,)).await
    }
    pub async fn remove_nodes(&self, arg0: RemoveNodesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "remove_nodes", (arg0,)).await
    }
    pub async fn remove_nodes_from_subnet(&self, arg0: RemoveNodesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "remove_nodes_from_subnet", (arg0,)).await
    }
    pub async fn reroute_canister_ranges(&self, arg0: RerouteCanisterRangesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "reroute_canister_ranges", (arg0,)).await
    }
    pub async fn revise_elected_guestos_versions(&self, arg0: ReviseElectedGuestosVersionsPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "revise_elected_guestos_versions", (arg0,)).await
    }
    pub async fn revise_elected_hostos_versions(&self, arg0: ReviseElectedHostosVersionsPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "revise_elected_hostos_versions", (arg0,)).await
    }
    pub async fn revise_elected_replica_versions(&self, arg0: ReviseElectedGuestosVersionsPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "revise_elected_replica_versions", (arg0,)).await
    }
    pub async fn set_firewall_config(&self, arg0: SetFirewallConfigPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "set_firewall_config", (arg0,)).await
    }
    pub async fn update_api_boundary_nodes_version(
        &self,
        arg0: UpdateApiBoundaryNodesVersionPayload,
    ) -> CallResult<()> {
        ic_cdk::call(self.0, "update_api_boundary_nodes_version", (arg0,)).await
    }
    pub async fn update_elected_hostos_versions(&self, arg0: UpdateElectedHostosVersionsPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_elected_hostos_versions", (arg0,)).await
    }
    pub async fn update_firewall_rules(&self, arg0: UpdateFirewallRulesPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_firewall_rules", (arg0,)).await
    }
    pub async fn update_node_directly(&self, arg0: UpdateNodeDirectlyPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_node_directly", (arg0,)).await
    }
    pub async fn update_node_domain_directly(
        &self,
        arg0: UpdateNodeDomainDirectlyPayload,
    ) -> CallResult<(UpdateNodeDomainDirectlyResponse,)> {
        ic_cdk::call(self.0, "update_node_domain_directly", (arg0,)).await
    }
    pub async fn update_node_ipv_4_config_directly(
        &self,
        arg0: UpdateNodeIPv4ConfigDirectlyPayload,
    ) -> CallResult<(UpdateNodeIpv4ConfigDirectlyResponse,)> {
        ic_cdk::call(self.0, "update_node_ipv4_config_directly", (arg0,)).await
    }
    pub async fn update_node_operator_config(&self, arg0: UpdateNodeOperatorConfigPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_node_operator_config", (arg0,)).await
    }
    pub async fn update_node_operator_config_directly(
        &self,
        arg0: UpdateNodeOperatorConfigDirectlyPayload,
    ) -> CallResult<()> {
        ic_cdk::call(self.0, "update_node_operator_config_directly", (arg0,)).await
    }
    pub async fn update_node_rewards_table(&self, arg0: UpdateNodeRewardsTableProposalPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_node_rewards_table", (arg0,)).await
    }
    pub async fn update_nodes_hostos_version(&self, arg0: UpdateNodesHostosVersionPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_nodes_hostos_version", (arg0,)).await
    }
    pub async fn update_ssh_readonly_access_for_all_unassigned_nodes(
        &self,
        arg0: UpdateSshReadOnlyAccessForAllUnassignedNodesPayload,
    ) -> CallResult<()> {
        ic_cdk::call(self.0, "update_ssh_readonly_access_for_all_unassigned_nodes", (arg0,)).await
    }
    pub async fn update_subnet(&self, arg0: UpdateSubnetPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_subnet", (arg0,)).await
    }
    pub async fn update_unassigned_nodes_config(&self, arg0: UpdateUnassignedNodesConfigPayload) -> CallResult<()> {
        ic_cdk::call(self.0, "update_unassigned_nodes_config", (arg0,)).await
    }
}
