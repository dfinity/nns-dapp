//! Code for customizinga  particular installation
use core::cell::RefCell;

/// Init and post_upgrade arguments
#[derive(Debug, Default, Eq, PartialEq)]
pub struct CanisterArguments {
    /// Values that are to be set in the web front end, by injecting them into Javascript.
    args: Vec<(String, String)>,
}

thread_local! {
  pub static CANISTER_ARGUMENTS: RefCell<CanisterArguments> = RefCell::new(CanisterArguments::default());
}

impl CanisterArguments {
    /// HTML to be appended onto _every_ index.html
    pub fn to_html(&self) -> String {
      r#"<meta name="nns-dapp-vars" data-canister-id="{canister_id}">"#.to_string()
    }
}