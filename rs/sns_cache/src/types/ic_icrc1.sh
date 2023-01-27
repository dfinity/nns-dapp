#!/usr/bin/env bash

cp /home/max/dfn/ic-gitlab/rs/rosetta-api/icrc1/ledger/icrc1.did ic_icrc1.did
{
  cat <<-EOF
	#![allow(non_camel_case_types)]

	use crate::types::{CandidType, Deserialize, Serialize, EmptyRecord};
	use ic_cdk::api::call::CallResult;
	EOF
  didc bind ic_icrc1.did --target rs | sed -E 's/^(struct|enum) /pub &/g;s/^use .*/\/\/ &/g;s/\<Deserialize\>/&, Serialize, Clone, Debug/g;s/^  [a-z].*:/  pub&/g;s/^( *pub ) *pub /\1/g'
} >ic_icrc1.rs
