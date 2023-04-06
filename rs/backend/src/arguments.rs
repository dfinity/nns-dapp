//! Code for customizinga  particular installation
use candid::{CandidType, Deserialize};
use core::cell::RefCell;
use regex::{Captures, Regex};
use serde::Serialize;
use std::collections::HashMap;

/// Init and post_upgrade arguments
#[derive(Debug, Default, Eq, PartialEq, CandidType, Serialize, Deserialize)]
pub struct CanisterArguments {
    /// Values that are to be set in the web front end, by injecting them into Javascript.
    pub args: Vec<(String, String)>,
}

thread_local! {
  pub static CANISTER_ARGUMENTS: RefCell<CanisterArguments> = RefCell::new(CanisterArguments::default().with_own_canister_id());
}

impl CanisterArguments {
    /// HTML to be appended onto _every_ index.html
    pub fn to_html(&self) -> String {
        let mut ans = r#"<meta name="nns-dapp-vars""#.to_string();
        for (key, value) in &self.args {
            ans.push_str("\n        ");
            ans.push_str(&configname2attributename(key));
            ans.push_str("=\"");
            ans.push_str(&configvalue2attributevalue(value));
            ans.push('"');
        }
        ans.push_str(">\n");
        ans
    }

    pub fn with_own_canister_id(mut self) -> Self {
        self.args
            .push(("OWN_CANISTER_ID".to_string(), ic_cdk::api::id().to_string()));
        self
    }

    pub fn may_scrape(network: &str) -> bool {
        ["local", "testnet"].contains(&network)
    }

    pub fn with_robots(mut self) -> Self {
        let may_scrape = self
            .args
            .iter()
            .find_map(|(key, val)| {
                if key == "DFX_NETWORK" {
                    Some(Self::may_scrape(&val))
                } else {
                    None
                }
            })
            .unwrap_or(false);
        let val = if may_scrape {
            ""
        } else {
            r#"<meta name="robots" content="noindex, nofollow" />"#
        };
        self.args.push(("ROBOTS".to_string(), val.to_string()));
        self
    }
}

/// Converts an upper-snake-case configuration variable to a lower-kebab-case name prefixed with data-.
/// This, in turn, will appear in JavaScript & family as camel case.
pub fn configname2attributename(name: &str) -> String {
    "data-".to_owned() + &name.replace('_', "-").to_lowercase()
}

/// Escapes a configuration value per the OWASP recommendation: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-for-html-contexts
pub fn configvalue2attributevalue(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

/// Sets arguments to the default value, or the provided value if given.
pub fn set_canister_arguments(canister_arguments: Option<CanisterArguments>) {
    let canister_arguments = canister_arguments
        .unwrap_or_default()
        .with_own_canister_id()
        .with_robots();
    CANISTER_ARGUMENTS.with(|args| {
        args.replace(canister_arguments);
    });
}

/// Replaces arguments in a template
pub struct TemplateEngine {
    args: HashMap<String, String>,
    regex: Regex,
}
impl TemplateEngine {
    /// Creates a templating engine from canister arguments
    pub fn new(key_val_pairs: &[(String, String)]) -> Self {
        let args = key_val_pairs.iter().cloned().collect();
        let regex = Regex::new(r"\$\{\{([_0-9A-Z]+)\}\}|<!-- *([_0-9A-Z]+) *-->").expect("Invalid regex");
        TemplateEngine { args, regex }
    }
    /// Replaces substrings of the form `${{ARG_KEY}}` with the corresponding argument value.
    pub fn populate(&self, input: &str) -> String {
        self.regex
            .replace_all(input, |cap: &Captures| {
                let key = cap.get(1).or_else(|| cap.get(2)).expect("Should be impossible");
                let val = self.args.get(key.as_str());
                val.cloned().unwrap_or_else(|| cap.get(0).unwrap().as_str().to_string())
            })
            .to_string()
    }
}
