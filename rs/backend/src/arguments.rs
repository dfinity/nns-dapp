//! Code for customizinga  particular installation
use core::cell::RefCell;

/// Init and post_upgrade arguments
#[derive(Debug, Default, Eq, PartialEq)]
pub struct CanisterArguments {
    /// Values that are to be set in the web front end, by injecting them into Javascript.
    args: Vec<(String, String)>,
}

thread_local! {
  pub static CANISTER_ARGUMENTS: RefCell<CanisterArguments> = RefCell::new(CanisterArguments::default().with_own_canister_id());
}

impl CanisterArguments {
    /// HTML to be appended onto _every_ index.html
    pub fn to_html(&self) -> String {
        let mut ans = r#"<meta name="nns-dapp-vars""#.to_string();
        for (key, value) in &self.args {
            ans.push(' ');
            ans.push_str(&configname2attributename(&key));
            ans.push('=');
            ans.push_str(&configvalue2attributevalue(&value));
        }
        ans.push('>');
        ans
    }

    pub fn with_own_canister_id(mut self) -> Self {
        self.args
            .push(("OWN_CANISTER_ID".to_string(), ic_cdk::api::id().to_string()));
        self
    }
}

/// Converts an upper-snake-case configuration variable to a lower-kebab-case name prefixed with data-.
/// This, in turn, will appear in JavaScript & family as camel case.
pub fn configname2attributename(name: &str) -> String {
    "data-".to_owned() + &name.replace("_", "-").to_lowercase()
}

/// Escapes a configuration value
pub fn configvalue2attributevalue(value: &str) -> String {
    serde_json::Value::String(value.to_string()).to_string()
}
