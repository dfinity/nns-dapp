#!/usr/bin/env bash

cp /home/max/dfn/ic/rs/sns/swap/canister/swap.did ic_sns_swap.did
{
  cat <<-EOF
	#![allow(non_camel_case_types)]

	use crate::types::{CandidType, Deserialize, Serialize, EmptyRecord};
	use ic_cdk::api::call::CallResult;
	EOF
  didc bind ic_sns_swap.did --target rs | sed -E 's/^(struct|enum) /pub &/g;s/^use .*/\/\/ &/g;s/\<Deserialize\>/&, Serialize, Clone, Debug/g;s/^  [a-z].*:/  pub&/g;s/^( *pub ) *pub /\1/g'
} >ic_sns_swap.rs
