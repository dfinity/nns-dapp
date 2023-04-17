//! Methods for converting between types

/// `ic_cdk` and `dfinity core` have different CanisterId types so we need to convert.  Genius.
///
/// We use a macro rather than importing PrincipalId from the core types as the core types may differ between SNS canisters.
#[macro_export]
macro_rules! convert_canister_id {
    ($x:expr) => {{
        CanisterId::from_str(&$x.expect(concat!("Missing canister ", stringify!($x))).to_string())
            .expect("Dfn and cdk disagree on canister types")
    }};
}
