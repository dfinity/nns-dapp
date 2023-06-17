//! Code for customizing a particular installation

#![warn(missing_docs)]
#![warn(clippy::missing_docs_in_private_items)]
#![deny(clippy::panic)]
#![deny(clippy::expect_used)]
#![deny(clippy::unwrap_used)]

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
  /// Arguments provided at installation or upgrade.
  pub static CANISTER_ARGUMENTS: RefCell<CanisterArguments> = RefCell::new(CanisterArguments::default().with_own_canister_id());
}

impl CanisterArguments {
    /// HTML meta tag to be included in every index.html
    ///
    /// Canister arguments are included in the meta tag as data attributes.  Thus:
    /// - Arguments are upper snake case with digits: `SAMPLE_ARG2`
    /// - In the tag, arguments are lower kebab case data attributes: `data-sample-arg2`
    /// - In Javascript the tag can be read as camel case with:
    ///   `document.querySelector('meta[name="nns-dapp-vars"]').dataset.sampleArg2`
    ///
    /// In Rust, the substitution is as follows:
    /// ```
    /// use nns_dapp::arguments::CanisterArguments;
    /// // The canister receives arguments when it is created.  The arguments typically include ROBOTS and similar values:
    /// let mut args: Vec<(String, String)> = CanisterArguments::args_from_str(&[("ROBOTS", r#"<meta name="robots" content="noindex, nofollow" />"#)]);
    ///
    /// // The OWN_CANISTER_ID is normally populated from the environment; we will set it directly
    /// // for the purposes of this demonstration:
    /// args.push(("OWN_CANISTER_ID".to_string(), "aeiouy".to_string()));
    ///
    /// // We now have complete arguments:
    /// let args = CanisterArguments{args};
    ///
    /// // The arguments are encoded as a meta tag like this:
    /// assert_eq!(args.to_html(), r#"<meta name="nns-dapp-vars"
    ///         data-robots="&lt;meta name=&quot;robots&quot; content=&quot;noindex, nofollow&quot; /&gt;"
    ///         data-own-canister-id="aeiouy">
    /// "#);
    ///
    /// // The meta tag is then inserted into HTML HEAD tags.
    /// ```
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

    /// Looks at the environment to get the canister ID and add it to the list of arguments.
    pub fn with_own_canister_id(mut self) -> Self {
        self.args
            .push(("OWN_CANISTER_ID".to_string(), ic_cdk::api::id().to_string()));
        self
    }

    /// Utility to convert static strings to an args field.
    ///
    /// ```
    /// use nns_dapp::arguments::CanisterArguments;
    /// let args = CanisterArguments::args_from_str(&[("FOO", "bar"), ("BAT", "man")]);
    /// let canister_arguments = CanisterArguments{args};
    /// ```
    #[allow(dead_code)]
    pub fn args_from_str(str_args: &[(&str, &str)]) -> Vec<(String, String)> {
        str_args
            .iter()
            .map(|(key, val)| (key.to_string(), val.to_string()))
            .collect()
    }
}

/// Converts an upper-snake-case configuration variable to a lower-kebab-case name prefixed with data-.
/// This, in turn, will appear in JavaScript & family as camel case.
///
/// ```
/// use nns_dapp::arguments::configname2attributename;
/// assert_eq!(configname2attributename("FOO"), "data-foo");
/// assert_eq!(configname2attributename("TERMINATOR_2"), "data-terminator-2");
/// ```
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
    let canister_arguments = canister_arguments.unwrap_or_default().with_own_canister_id();
    CANISTER_ARGUMENTS.with(|args| {
        args.replace(canister_arguments);
    });
}

/// Replaces arguments in a template
pub struct TemplateEngine {
    /// Values to replace
    args: HashMap<String, String>,
    /// The regular expression used to identify strings to replace.
    regex: Regex,
}
impl TemplateEngine {
    /// Creates a templating engine from canister arguments
    ///
    /// * The keys must be upper snake case, i.e. consist of the characters `A-Z0-9_`.
    /// * Values are taken from the engine `args` map.
    ///
    /// # Examples
    /// ```
    /// use nns_dapp::arguments::{TemplateEngine, CanisterArguments};
    /// let values: Vec<(String, String)> = CanisterArguments::args_from_str(&[("FOO", "bar"), ("SUPERMAN", "Peter Parker"), ("SUPER-MAN", "Lex Luthor"), ("lowercase", "SKY HIGH")]);
    /// let template_engine = TemplateEngine::new(&values[..]);
    /// assert_eq!(template_engine.populate("${{FOO}}"), "bar");
    /// assert_eq!(template_engine.populate("<!--FOO-->"), "bar");
    /// assert_eq!(template_engine.populate("They say that <!--SUPERMAN--> is ${{SUPER-MAN}}"), "They say that Peter Parker is ${{SUPER-MAN}}", "Hyphens are not supported");
    /// assert_eq!(template_engine.populate("${{lowercase}}"), "${{lowercase}}", "Only uppercase, digits and underscore are valid");
    /// ```

    pub fn new(key_val_pairs: &[(String, String)]) -> Self {
        let args = key_val_pairs.iter().cloned().collect();
        // Please see .populate() to learn what this regex does.
        #[allow(clippy::expect_used)]
        let regex = Regex::new(r"\$\{\{([_0-9A-Z]+)\}\}|<!-- *([_0-9A-Z]+) *-->").expect("Invalid regex");
        TemplateEngine { args, regex }
    }

    /// Replaces substrings of the form `${{ARG_KEY}}` and `<!-- ARG_KEY -->` with the corresponding argument value.
    ///
    /// * The keys must be upper snake case, i.e. consist of the characters `A-Z0-9_`.
    /// * Values are taken from the engine `args` map.
    ///   * If no match is found in the args map, variables are left unchanged.
    ///
    pub fn populate(&self, input: &str) -> String {
        self.regex
            .replace_all(input, |cap: &Captures| {
                if let Some(key) = cap.get(1).or_else(|| cap.get(2)) {
                    let val = self.args.get(key.as_str());
                    val.cloned()
                        .unwrap_or_else(|| cap.get(0).map(|x| x.as_str().to_string()).unwrap_or_default())
                } else {
                    "REGEX ERROR".to_string()
                }
            })
            .to_string()
    }
}
