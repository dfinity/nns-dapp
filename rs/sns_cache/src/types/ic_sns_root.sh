#!/usr/bin/env bash

cp ~/dfn/ic/rs/sns/root/canister/root.did ic_sns_root.did
{
	cat <<-EOF
	#![allow(non_camel_case_types)]

	use crate::types::{CandidType, Deserialize, Serialize, EmptyRecord};
	use ic_cdk::api::call::CallResult;
	EOF
	didc bind ic_sns_root.did --target rs | sed -E 's/^(struct|enum) /pub &/g;s/^use .*/\/\/ &/g;s/\<Deserialize\>/&, Serialize, Clone, Debug/g;s/^  [a-z].*:/  pub&/g;s/^( *pub ) *pub /\1/g'
} > ic_sns_root.rs
