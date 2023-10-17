import type { CachedSnsDto } from "$lib/types/sns-aggregator";

[
  {
    index: 0,
    canister_ids: {
      root_canister_id: "zxeu2-7aaaa-aaaaq-aaafa-cai",
      governance_canister_id: "zqfso-syaaa-aaaaq-aaafq-cai",
      index_canister_id: "zlaol-iaaaa-aaaaq-aaaha-cai",
      swap_canister_id: "zcdfx-6iaaa-aaaaq-aaagq-cai",
      ledger_canister_id: "zfcdd-tqaaa-aaaaq-aaaga-cai",
    },
    list_sns_canisters: {
      root: "zxeu2-7aaaa-aaaaq-aaafa-cai",
      swap: "zcdfx-6iaaa-aaaaq-aaagq-cai",
      ledger: "zfcdd-tqaaa-aaaaq-aaaga-cai",
      index: "zlaol-iaaaa-aaaaq-aaaha-cai",
      governance: "zqfso-syaaa-aaaaq-aaafq-cai",
      dapps: [
        "sqbzf-5aaaa-aaaam-aavya-cai",
        "epeco-piaaa-aaaai-qatka-cai",
        "thhc2-kiaaa-aaaao-ajnha-cai",
      ],
      archives: ["zmbi7-fyaaa-aaaaq-aaahq-cai"],
    },
    meta: {
      url: "https://dragginz.io",
      name: "Dragginz",
      description:
        "A virtual pets game from the creators of Neopets.  Non-profit, 100% on-chain.  We've got baby dragons, crowdsourced world building, magic spells, and a prince in disguise!",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "Unspecified",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Deegister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1001,
          name: "addNewSnsToTaggrBot",
          description: "Adds a new SNS to the @snsproposals Taggr bot",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "thhc2-kiaaa-aaaao-ajnha-cai",
              target_canister_id: "thhc2-kiaaa-aaaao-ajnha-cai",
              validator_method_name: "snsDataValidator",
              target_method_name: "addNewSns",
            },
          },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 3,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "zxeu2-7aaaa-aaaaq-aaafa-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "73his-v347r-keigq-mah4l-4sruk-4by32-iehd4-waept-meslh-ewxzn-aqe",
            "b6ps5-uiaaa-aaaal-abhta-cai",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 1000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 1000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "zfcdd-tqaaa-aaaaq-aaaga-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "zqfso-syaaa-aaaaq-aaafq-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: {
          min_participant_icp_e8s: 10000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 2629800,
            count: 2,
          },
          max_icp_e8s: 314100000000,
          swap_due_timestamp_seconds: 1670673600,
          min_participants: 50,
          sns_token_e8s: 314100000000,
          sale_delay_seconds: null,
          max_participant_icp_e8s: 100000000,
          min_icp_e8s: 5000000000,
        },
        open_sns_token_swap_proposal_id: 93763,
        decentralization_sale_open_timestamp_seconds: null,
      },
      derived: {
        buyer_total_icp_e8s: 314100000000,
        sns_tokens_per_icp: 1.0,
      },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "SNS-1" }],
      ["icrc1:symbol", { Text: "SNS1" }],
      ["icrc1:fee", { Nat: [1000] }],
    ],
    icrc1_fee: [1000],
    icrc1_total_supply: 999715984000,
    swap_params: {
      params: {
        min_participant_icp_e8s: 10000000,
        neuron_basket_construction_parameters: {
          dissolve_delay_interval_seconds: 2629800,
          count: 2,
        },
        max_icp_e8s: 314100000000,
        swap_due_timestamp_seconds: 1670673600,
        min_participants: 50,
        sns_token_e8s: 314100000000,
        sale_delay_seconds: null,
        max_participant_icp_e8s: 100000000,
        min_icp_e8s: 5000000000,
      },
    },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "zxeu2-7aaaa-aaaaq-aaafa-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "73his-v347r-keigq-mah4l-4sruk-4by32-iehd4-waept-meslh-ewxzn-aqe",
          "b6ps5-uiaaa-aaaal-abhta-cai",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 1000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 1000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "zfcdd-tqaaa-aaaaq-aaaga-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "zqfso-syaaa-aaaaq-aaafq-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 1.0,
      buyer_total_icp_e8s: 314100000000,
      cf_participant_count: null,
      direct_participant_count: null,
      cf_neuron_count: null,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: null,
      lifecycle: 3,
    },
  },
  {
    index: 1,
    canister_ids: {
      root_canister_id: "3e3x2-xyaaa-aaaaq-aaalq-cai",
      governance_canister_id: "2jvtu-yqaaa-aaaaq-aaama-cai",
      index_canister_id: "2awyi-oyaaa-aaaaq-aaanq-cai",
      swap_canister_id: "2hx64-daaaa-aaaaq-aaana-cai",
      ledger_canister_id: "2ouva-viaaa-aaaaq-aaamq-cai",
    },
    list_sns_canisters: {
      root: "3e3x2-xyaaa-aaaaq-aaalq-cai",
      swap: "2hx64-daaaa-aaaaq-aaana-cai",
      ledger: "2ouva-viaaa-aaaaq-aaamq-cai",
      index: "2awyi-oyaaa-aaaaq-aaanq-cai",
      governance: "2jvtu-yqaaa-aaaaq-aaama-cai",
      dapps: [
        "6hsbt-vqaaa-aaaaf-aaafq-cai",
        "4glvk-ryaaa-aaaaf-aaaia-cai",
        "4bkt6-4aaaa-aaaaf-aaaiq-cai",
        "4ijyc-kiaaa-aaaaf-aaaja-cai",
        "3vlw6-fiaaa-aaaaf-aaa3a-cai",
        "rturd-qaaaa-aaaaf-aabaq-cai",
        "gonut-hqaaa-aaaaf-aby7a-cai",
        "iywa7-ayaaa-aaaaf-aemga-cai",
        "wkype-7qaaa-aaaar-ajfyq-cai",
        "r2pvs-tyaaa-aaaar-ajcwq-cai",
        "cpi5u-yiaaa-aaaar-aqw5a-cai",
      ],
      archives: ["2sqpr-ciaaa-aaaaq-aaaoq-cai"],
    },
    meta: {
      url: "https://oc.app",
      name: "OpenChat",
      description:
        "A decentralized chat app governed by the people for the people",
    },
    parameters: {
      reserved_ids: [1005, 1006, 1007, 5000],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1000,
          name: "Upgrade local_user_index canisters",
          description:
            "This will upload the given WASM to the user_index and trigger a rolling upgrade of local_user_index canisters on each subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name:
                "upgrade_local_user_index_canister_wasm_validate",
              target_method_name: "upgrade_local_user_index_canister_wasm",
            },
          },
        },
        {
          id: 1001,
          name: "Upgrade user canisters",
          description:
            "This will upload the given WASM to the user_index which will in turn call c2c_upgrade_user_canister_wasm on the local_user_index on each subnet. These will each trigger a rolling upgrade of user canisters on their subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "upgrade_user_canister_wasm_validate",
              target_method_name: "upgrade_user_canister_wasm",
            },
          },
        },
        {
          id: 1002,
          name: "Add new local_user_index canister",
          description:
            "This will add a reference to an uninstalled local_user_index canister on a new subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "add_local_user_index_canister_validate",
              target_method_name: "add_local_user_index_canister",
            },
          },
        },
        {
          id: 1003,
          name: "Mark local_user_index full",
          description:
            "This will mark the local_user_index with the given canister_id as full so that no more users will be created on this subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "mark_local_user_index_full_validate",
              target_method_name: "mark_local_user_index_full",
            },
          },
        },
        {
          id: 1004,
          name: "Set max concurrent user canister upgrades",
          description:
            "During a rolling user canister upgrade this controls how many user canisters can be upgraded concurrently. Setting a value of zero stops the upgrade altogether. Setting this value too high will slow down subnets during user upgrade.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name:
                "set_max_concurrent_user_canister_upgrades_validate",
              target_method_name: "set_max_concurrent_user_canister_upgrades",
            },
          },
        },
        {
          id: 1008,
          name: "Add a platform moderator",
          description:
            "The user with the given user id will be given the role of platform moderator. These users have the authority to suspend users and freeze groups.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "add_platform_moderator_validate",
              target_method_name: "add_platform_moderator",
            },
          },
        },
        {
          id: 1009,
          name: "Remove a platform moderator",
          description:
            "The user with the given user id will have the role of platform moderator rescinded.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "remove_platform_moderator_validate",
              target_method_name: "remove_platform_moderator",
            },
          },
        },
        {
          id: 1010,
          name: "Add a platform operator",
          description:
            "The user with the given user id will be given the role of platform operator. These users have the authority to call endpoints which affect rolling canister deployments such as setting the concurrency level.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "add_platform_operator_validate",
              target_method_name: "add_platform_operator",
            },
          },
        },
        {
          id: 1011,
          name: "Remove a platform operator",
          description:
            "The user with the given user id will have the role of platform operator rescinded.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              target_canister_id: "4bkt6-4aaaa-aaaaf-aaaiq-cai",
              validator_method_name: "remove_platform_operator_validate",
              target_method_name: "remove_platform_operator",
            },
          },
        },
        {
          id: 2000,
          name: "Upgrade local_group_index canisters",
          description:
            "This will upload the given WASM to the group_index and trigger a rolling upgrade of local_group_index canisters on each subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              target_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              validator_method_name:
                "upgrade_local_group_index_canister_wasm_validate",
              target_method_name: "upgrade_local_group_index_canister_wasm",
            },
          },
        },
        {
          id: 2001,
          name: "Upgrade group canisters",
          description:
            "This will upload the given WASM to the group_index which will in turn call c2c_upgrade_group_canister_wasm on the local_group_index on each subnet. These will each trigger a rolling upgrade of group canisters on their subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              target_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              validator_method_name: "upgrade_group_canister_wasm_validate",
              target_method_name: "upgrade_group_canister_wasm",
            },
          },
        },
        {
          id: 2002,
          name: "Add new local_group_index",
          description:
            "This will add a reference to an uninstalled local_group_index canister on a new subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              target_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              validator_method_name: "add_local_group_index_canister_validate",
              target_method_name: "add_local_group_index_canister",
            },
          },
        },
        {
          id: 2003,
          name: "Mark local_group_index full",
          description:
            "This will mark the local_group_index with the given canister_id as full so that no more groups will be created on this subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              target_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              validator_method_name: "mark_local_group_index_full_validate",
              target_method_name: "mark_local_group_index_full",
            },
          },
        },
        {
          id: 2004,
          name: "Set max concurrent group canister upgrades",
          description:
            "During a rolling group canister upgrade this controls how many group canisters can be upgraded concurrently. Setting a value of zero stops the upgrade altogether. Setting this value too high will slow down subnets during group upgrade.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              target_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              validator_method_name:
                "set_max_concurrent_group_canister_upgrades_validate",
              target_method_name: "set_max_concurrent_group_canister_upgrades",
            },
          },
        },
        {
          id: 2005,
          name: "Upgrade community canisters",
          description:
            "This will upload the given WASM to the group_index which will in turn call c2c_upgrade_community_canister_wasm on the local_group_index on each subnet. These will each trigger a rolling upgrade of community canisters on their subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              target_canister_id: "4ijyc-kiaaa-aaaaf-aaaja-cai",
              validator_method_name: "upgrade_community_canister_wasm_validate",
              target_method_name: "upgrade_community_canister_wasm",
            },
          },
        },
        {
          id: 3000,
          name: "Upgrade notifications canisters",
          description:
            "This will upload the given WASM to the notifications_index and trigger a rolling upgrade of notifications_canisters on each subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4glvk-ryaaa-aaaaf-aaaia-cai",
              target_canister_id: "4glvk-ryaaa-aaaaf-aaaia-cai",
              validator_method_name:
                "upgrade_notifications_canister_wasm_validate",
              target_method_name: "upgrade_notifications_canister_wasm",
            },
          },
        },
        {
          id: 3001,
          name: "Add notifications canister",
          description:
            "This will add a reference to an uninstalled notifications canister on a new subnet.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "4glvk-ryaaa-aaaaf-aaaia-cai",
              target_canister_id: "4glvk-ryaaa-aaaaf-aaaia-cai",
              validator_method_name: "add_notifications_canister_validate",
              target_method_name: "add_notifications_canister",
            },
          },
        },
        {
          id: 4000,
          name: "Add SNS proposals group",
          description:
            "This will create a new proposals group with the given details and sync it with proposals from the given SNS governance canister.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              target_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              validator_method_name: "add_governance_canister_validate",
              target_method_name: "add_governance_canister",
            },
          },
        },
        {
          id: 4001,
          name: "Remove SNS proposals group",
          description:
            "This will remove a proposals group linked to the given SNS governance canister id.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              target_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              validator_method_name: "remove_governance_canister_validate",
              target_method_name: "remove_governance_canister",
            },
          },
        },
        {
          id: 4002,
          name: "Appoint admins in proposals group",
          description:
            "For each given user, the proposals_bot will call into the group canister corresponding to the given governance canister, to set the user's role within the group to admin.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              target_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              validator_method_name: "appoint_admins_validate",
              target_method_name: "appoint_admins",
            },
          },
        },
        {
          id: 4003,
          name: "Import proposals group into community",
          description:
            "Import the specified proposals group into the specified community.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              target_canister_id: "iywa7-ayaaa-aaaaf-aemga-cai",
              validator_method_name:
                "import_proposals_group_into_community_validate",
              target_method_name: "import_proposals_group_into_community",
            },
          },
        },
        {
          id: 5001,
          name: "Add new storage_bucket canister",
          description:
            "This will add a reference to an uninstalled storage_bucket canister.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "rturd-qaaaa-aaaaf-aabaq-cai",
              target_canister_id: "rturd-qaaaa-aaaaf-aabaq-cai",
              validator_method_name: "add_bucket_canister_validate",
              target_method_name: "add_bucket_canister",
            },
          },
        },
        {
          id: 5002,
          name: "Mark storage_bucket full",
          description:
            "This will mark the storage_bucket with the given canister_id as full so that no more files will be uploaded to this bucket.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "rturd-qaaaa-aaaaf-aabaq-cai",
              target_canister_id: "rturd-qaaaa-aaaaf-aabaq-cai",
              validator_method_name: "set_bucket_full_validate",
              target_method_name: "set_bucket_full",
            },
          },
        },
        {
          id: 5003,
          name: "Upgrade storage_bucket canisters",
          description:
            "This will upload the given WASM to the storage_index canister and trigger a rolling upgrade of the storage_bucket canisters.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "rturd-qaaaa-aaaaf-aabaq-cai",
              target_canister_id: "rturd-qaaaa-aaaaf-aabaq-cai",
              validator_method_name: "upgrade_bucket_canister_wasm_validate",
              target_method_name: "upgrade_bucket_canister_wasm",
            },
          },
        },
        {
          id: 6000,
          name: "Add canister to cycles_dispenser",
          description:
            "The cycles_dispenser will keep the added canister topped up with cycles.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "gonut-hqaaa-aaaaf-aby7a-cai",
              target_canister_id: "gonut-hqaaa-aaaaf-aby7a-cai",
              validator_method_name: "add_canister_validate",
              target_method_name: "add_canister",
            },
          },
        },
        {
          id: 6001,
          name: "Update cycles_dispenser config",
          description:
            "This will update the configuration of the cycles_dispenser canister such as max_top_up_amount and min_cycles_balance.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "gonut-hqaaa-aaaaf-aby7a-cai",
              target_canister_id: "gonut-hqaaa-aaaaf-aby7a-cai",
              validator_method_name: "update_config_validate",
              target_method_name: "update_config",
            },
          },
        },
        {
          id: 7000,
          name: "Add token to Registry",
          description:
            "This will add the specified token to the Registry, enabling users to send it within OpenChat messages.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "cpi5u-yiaaa-aaaar-aqw5a-cai",
              target_canister_id: "cpi5u-yiaaa-aaaar-aqw5a-cai",
              validator_method_name: "add_token_validate",
              target_method_name: "add_token",
            },
          },
        },
        {
          id: 100000,
          name: "Call receive_tokens on InfinitySwap's CHAT/ICP Swap canister",
          description:
            "After transferring CHAT or ICP to InfinitySwap, the OpenChat SNS needs to call `receive_tokens` to notify InfinitySwap of the transfer.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "wkype-7qaaa-aaaar-ajfyq-cai",
              target_canister_id: "vahkw-kaaaa-aaaal-acaza-cai",
              validator_method_name: "infinity_swap_receive_tokens_validate",
              target_method_name: "receive_tokens",
            },
          },
        },
        {
          id: 100001,
          name: "Call mint on InfinitySwap's CHAT/ICP Swap canister",
          description:
            "Calling `mint` on InfinitySwap's CHAT/ICP Swap canister instructs it to 'mint' new liquidity from the tokens it has been transferred.",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "wkype-7qaaa-aaaar-ajfyq-cai",
              target_canister_id: "vahkw-kaaaa-aaaal-acaza-cai",
              validator_method_name: "infinity_swap_mint_validate",
              target_method_name: "mint",
            },
          },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 3,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "3e3x2-xyaaa-aaaaq-aaalq-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "tu45y-p4p3d-b4gg4-gmyy3-rgweo-whsrq-fephi-vshrn-cipca-xdkri-pae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 400000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "2ouva-viaaa-aaaaq-aaamq-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "2jvtu-yqaaa-aaaaq-aaama-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: {
          min_participant_icp_e8s: 100000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 7884000,
            count: 5,
          },
          max_icp_e8s: 100000000000000,
          swap_due_timestamp_seconds: 1679054400,
          min_participants: 500,
          sns_token_e8s: 2500000000000000,
          sale_delay_seconds: 82128,
          max_participant_icp_e8s: 10000000000000,
          min_icp_e8s: 50000000000000,
        },
        open_sns_token_swap_proposal_id: 109811,
        decentralization_sale_open_timestamp_seconds: 1677826762,
      },
      derived: {
        buyer_total_icp_e8s: 100000000000000,
        sns_tokens_per_icp: 25.0,
      },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "CHAT" }],
      ["icrc1:symbol", { Text: "CHAT" }],
      ["icrc1:fee", { Nat: [100000] }],
    ],
    icrc1_fee: [100000],
    icrc1_total_supply: 10002917143216362,
    swap_params: {
      params: {
        min_participant_icp_e8s: 100000000,
        neuron_basket_construction_parameters: {
          dissolve_delay_interval_seconds: 7884000,
          count: 5,
        },
        max_icp_e8s: 100000000000000,
        swap_due_timestamp_seconds: 1679054400,
        min_participants: 500,
        sns_token_e8s: 2500000000000000,
        sale_delay_seconds: 82128,
        max_participant_icp_e8s: 10000000000000,
        min_icp_e8s: 50000000000000,
      },
    },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "3e3x2-xyaaa-aaaaq-aaalq-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "tu45y-p4p3d-b4gg4-gmyy3-rgweo-whsrq-fephi-vshrn-cipca-xdkri-pae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 400000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "2ouva-viaaa-aaaaq-aaamq-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "2jvtu-yqaaa-aaaaq-aaama-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 25.0,
      buyer_total_icp_e8s: 100000000000000,
      cf_participant_count: null,
      direct_participant_count: null,
      cf_neuron_count: null,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: 1677826762,
      lifecycle: 3,
    },
  },
  {
    index: 2,
    canister_ids: {
      root_canister_id: "23ten-uaaaa-aaaaq-aaapa-cai",
      governance_canister_id: "24scz-zyaaa-aaaaq-aaapq-cai",
      index_canister_id: "7olvu-jaaaa-aaaaq-aaara-cai",
      swap_canister_id: "7hi6i-7iaaa-aaaaq-aaaqq-cai",
      ledger_canister_id: "7ajy4-sqaaa-aaaaq-aaaqa-cai",
    },
    list_sns_canisters: {
      root: "23ten-uaaaa-aaaaq-aaapa-cai",
      swap: "7hi6i-7iaaa-aaaaq-aaaqq-cai",
      ledger: "7ajy4-sqaaa-aaaaq-aaaqa-cai",
      index: "7olvu-jaaaa-aaaaq-aaara-cai",
      governance: "24scz-zyaaa-aaaaq-aaapq-cai",
      dapps: [],
      archives: [],
    },
    meta: {
      url: "https://app.sonic.ooo",
      name: "SONIC",
      description:
        "The open DeFi suite on Internet Computer blockchain by the people for the people. Sonic unleashes the potential of crypto trading through innovative DeFi products. https://app.sonic.ooo",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 4,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "23ten-uaaaa-aaaaq-aaapa-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "vfk4j-pkwtu-uj3kn-apwsz-g2gm4-vmrl5-tgwbs-43c6u-mlw4d-uysvm-gae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 500000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "7ajy4-sqaaa-aaaaq-aaaqa-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "24scz-zyaaa-aaaaq-aaapq-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: null,
        open_sns_token_swap_proposal_id: null,
        decentralization_sale_open_timestamp_seconds: null,
      },
      derived: { buyer_total_icp_e8s: 0, sns_tokens_per_icp: 0.0 },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "SONIC" }],
      ["icrc1:symbol", { Text: "SOC" }],
      ["icrc1:fee", { Nat: [100000] }],
    ],
    icrc1_fee: [100000],
    icrc1_total_supply: 12500000000000000,
    swap_params: { params: null },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "23ten-uaaaa-aaaaq-aaapa-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "vfk4j-pkwtu-uj3kn-apwsz-g2gm4-vmrl5-tgwbs-43c6u-mlw4d-uysvm-gae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 500000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "7ajy4-sqaaa-aaaaq-aaaqa-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "24scz-zyaaa-aaaaq-aaapq-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 0.0,
      buyer_total_icp_e8s: 0,
      cf_participant_count: null,
      direct_participant_count: null,
      cf_neuron_count: null,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: null,
      lifecycle: 4,
    },
  },
  {
    index: 3,
    canister_ids: {
      root_canister_id: "7jkta-eyaaa-aaaaq-aaarq-cai",
      governance_canister_id: "74ncn-fqaaa-aaaaq-aaasa-cai",
      index_canister_id: "7vojr-tyaaa-aaaaq-aaatq-cai",
      swap_canister_id: "7sppf-6aaaa-aaaaq-aaata-cai",
      ledger_canister_id: "73mez-iiaaa-aaaaq-aaasq-cai",
    },
    list_sns_canisters: {
      root: "7jkta-eyaaa-aaaaq-aaarq-cai",
      swap: "7sppf-6aaaa-aaaaq-aaata-cai",
      ledger: "73mez-iiaaa-aaaaq-aaasq-cai",
      index: "7vojr-tyaaa-aaaaq-aaatq-cai",
      governance: "74ncn-fqaaa-aaaaq-aaasa-cai",
      dapps: [
        "msqgt-mqaaa-aaaaf-qaj2a-cai",
        "nw5jb-vqaaa-aaaaf-qaj4a-cai",
        "74iy7-xqaaa-aaaaf-qagra-cai",
        "ny7ej-oaaaa-aaaaf-qaj5a-cai",
      ],
      archives: ["6yan7-4qaaa-aaaaq-aaaua-cai"],
    },
    meta: {
      url: "https://kinic.io/",
      name: "Kinic",
      description:
        "The first and only dedicated search engine for web3 content that is hosted on blockchain or decentralized storage networks",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1000,
          name: "grant_permission",
          description: "grant permission to asset canister",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "74iy7-xqaaa-aaaaf-qagra-cai",
              target_canister_id: "74iy7-xqaaa-aaaaf-qagra-cai",
              validator_method_name: "validate_grant_permission",
              target_method_name: "grant_permission",
            },
          },
        },
        {
          id: 1001,
          name: "revoke_permission",
          description: "revoke permission to asset canister",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "74iy7-xqaaa-aaaaf-qagra-cai",
              target_canister_id: "74iy7-xqaaa-aaaaf-qagra-cai",
              validator_method_name: "validate_revoke_permission",
              target_method_name: "revoke_permission",
            },
          },
        },
        {
          id: 1003,
          name: "commit_proposed_batch",
          description:
            "commit the batch that proposed by community who has Prepare permisson",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "74iy7-xqaaa-aaaaf-qagra-cai",
              target_canister_id: "74iy7-xqaaa-aaaaf-qagra-cai",
              validator_method_name: "validate_commit_proposed_batch",
              target_method_name: "commit_proposed_batch",
            },
          },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 3,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "7jkta-eyaaa-aaaaq-aaarq-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "dl4qi-ihmtt-ug3sl-bnick-g4c2c-kmux5-whva5-mtdst-pbbmh-vkcpf-bae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 10000000,
          confirmation_text:
            "Any person that purchases, holds, owns, or otherwise directly or indirectly controls or benefits from one or more KINIC tokens (a “Tokenholder”) acknowledges that they have read the Kinic white paper in it’s entirety, and have fully understood and agree to section 7. ‘Token Holder Rights and Limitations’. Please confirm that you have read the white paper and agree to follow its content.",
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "73mez-iiaaa-aaaaq-aaasq-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "74ncn-fqaaa-aaaaq-aaasa-cai",
          restricted_countries: { iso_codes: ["US"] },
          min_icp_e8s: null,
        },
        params: {
          min_participant_icp_e8s: 100000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 7889400,
            count: 5,
          },
          max_icp_e8s: 150000000000000,
          swap_due_timestamp_seconds: 1686979337,
          min_participants: 300,
          sns_token_e8s: 150000000000000,
          sale_delay_seconds: 86400,
          max_participant_icp_e8s: 10000000000000,
          min_icp_e8s: 50000000000000,
        },
        open_sns_token_swap_proposal_id: 122749,
        decentralization_sale_open_timestamp_seconds: 1686150901,
      },
      derived: {
        buyer_total_icp_e8s: 50992351828093,
        sns_tokens_per_icp: 2.9416175,
      },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "KINIC" }],
      ["icrc1:symbol", { Text: "KINIC" }],
      ["icrc1:fee", { Nat: [100000] }],
    ],
    icrc1_fee: [100000],
    icrc1_total_supply: 600010562900687,
    swap_params: {
      params: {
        min_participant_icp_e8s: 100000000,
        neuron_basket_construction_parameters: {
          dissolve_delay_interval_seconds: 7889400,
          count: 5,
        },
        max_icp_e8s: 150000000000000,
        swap_due_timestamp_seconds: 1686979337,
        min_participants: 300,
        sns_token_e8s: 150000000000000,
        sale_delay_seconds: 86400,
        max_participant_icp_e8s: 10000000000000,
        min_icp_e8s: 50000000000000,
      },
    },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "7jkta-eyaaa-aaaaq-aaarq-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "dl4qi-ihmtt-ug3sl-bnick-g4c2c-kmux5-whva5-mtdst-pbbmh-vkcpf-bae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 10000000,
        confirmation_text:
          "Any person that purchases, holds, owns, or otherwise directly or indirectly controls or benefits from one or more KINIC tokens (a “Tokenholder”) acknowledges that they have read the Kinic white paper in it’s entirety, and have fully understood and agree to section 7. ‘Token Holder Rights and Limitations’. Please confirm that you have read the white paper and agree to follow its content.",
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "73mez-iiaaa-aaaaq-aaasq-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "74ncn-fqaaa-aaaaq-aaasa-cai",
        restricted_countries: { iso_codes: ["US"] },
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 2.941617488861084,
      buyer_total_icp_e8s: 50992351828093,
      cf_participant_count: 90,
      direct_participant_count: 741,
      cf_neuron_count: 130,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: 1686150901,
      lifecycle: 3,
    },
  },
  {
    index: 4,
    canister_ids: {
      root_canister_id: "67bll-riaaa-aaaaq-aaauq-cai",
      governance_canister_id: "6wcax-haaaa-aaaaq-aaava-cai",
      index_canister_id: "6dfr2-giaaa-aaaaq-aaawq-cai",
      swap_canister_id: "6eexo-lqaaa-aaaaq-aaawa-cai",
      ledger_canister_id: "6rdgd-kyaaa-aaaaq-aaavq-cai",
    },
    list_sns_canisters: {
      root: "67bll-riaaa-aaaaq-aaauq-cai",
      swap: "6eexo-lqaaa-aaaaq-aaawa-cai",
      ledger: "6rdgd-kyaaa-aaaaq-aaavq-cai",
      index: "6dfr2-giaaa-aaaaq-aaawq-cai",
      governance: "6wcax-haaaa-aaaaq-aaava-cai",
      dapps: [
        "jwktp-qyaaa-aaaag-abcfa-cai",
        "y6yjf-jyaaa-aaaal-qbd6q-cai",
        "vyatz-hqaaa-aaaam-qauea-cai",
        "rimrc-piaaa-aaaao-aaljq-cai",
        "efsfj-sqaaa-aaaap-qatwa-cai",
      ],
      archives: ["4zzzg-yyaaa-aaaaq-aaazq-cai"],
    },
    meta: {
      url: "https://hotornot.wtf",
      name: "Hot or Not",
      description:
        "A decentralized short-video social media platform governed by the people for the people",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1000,
          name: "grant_permission",
          description: "grant permission to asset canister",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "vyatz-hqaaa-aaaam-qauea-cai",
              target_canister_id: "vyatz-hqaaa-aaaam-qauea-cai",
              validator_method_name: "validate_grant_permission",
              target_method_name: "grant_permission",
            },
          },
        },
        {
          id: 1001,
          name: "revoke_permission",
          description: "revoke permission to asset canister",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: "vyatz-hqaaa-aaaam-qauea-cai",
              target_canister_id: "vyatz-hqaaa-aaaam-qauea-cai",
              validator_method_name: "validate_revoke_permission",
              target_method_name: "revoke_permission",
            },
          },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 3,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "67bll-riaaa-aaaaq-aaauq-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "7gaq2-4kttl-vtbt4-oo47w-igteo-cpk2k-57h3p-yioqe-wkawi-wz45g-jae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 500000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "6rdgd-kyaaa-aaaaq-aaavq-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "6wcax-haaaa-aaaaq-aaava-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: {
          min_participant_icp_e8s: 100000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 15778800,
            count: 5,
          },
          max_icp_e8s: 200000000000000,
          swap_due_timestamp_seconds: 1689235200,
          min_participants: 500,
          sns_token_e8s: 33000000000000000,
          sale_delay_seconds: 36000,
          max_participant_icp_e8s: 15000000000000,
          min_icp_e8s: 100000000000000,
        },
        open_sns_token_swap_proposal_id: 123252,
        decentralization_sale_open_timestamp_seconds: 1687832383,
      },
      derived: {
        buyer_total_icp_e8s: 107402789035875,
        sns_tokens_per_icp: 307.25458,
      },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "HotOrNot" }],
      ["icrc1:symbol", { Text: "HOT" }],
      ["icrc1:fee", { Nat: [100000] }],
    ],
    icrc1_fee: [100000],
    icrc1_total_supply: 100000001544666698,
    swap_params: {
      params: {
        min_participant_icp_e8s: 100000000,
        neuron_basket_construction_parameters: {
          dissolve_delay_interval_seconds: 15778800,
          count: 5,
        },
        max_icp_e8s: 200000000000000,
        swap_due_timestamp_seconds: 1689235200,
        min_participants: 500,
        sns_token_e8s: 33000000000000000,
        sale_delay_seconds: 36000,
        max_participant_icp_e8s: 15000000000000,
        min_icp_e8s: 100000000000000,
      },
    },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "67bll-riaaa-aaaaq-aaauq-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "7gaq2-4kttl-vtbt4-oo47w-igteo-cpk2k-57h3p-yioqe-wkawi-wz45g-jae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 500000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "6rdgd-kyaaa-aaaaq-aaavq-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "6wcax-haaaa-aaaaq-aaava-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 307.25457763671875,
      buyer_total_icp_e8s: 107402789035875,
      cf_participant_count: 142,
      direct_participant_count: 1157,
      cf_neuron_count: 179,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: 1687832383,
      lifecycle: 3,
    },
  },
  {
    index: 5,
    canister_ids: {
      root_canister_id: "6kg2g-qaaaa-aaaaq-aaaxa-cai",
      governance_canister_id: "6nh4s-5yaaa-aaaaq-aaaxq-cai",
      index_canister_id: "46y7s-vaaaa-aaaaq-aaaza-cai",
      swap_canister_id: "4x3uo-diaaa-aaaaq-aaayq-cai",
      ledger_canister_id: "4q2s2-oqaaa-aaaaq-aaaya-cai",
    },
    list_sns_canisters: {
      root: "6kg2g-qaaaa-aaaaq-aaaxa-cai",
      swap: "4x3uo-diaaa-aaaaq-aaayq-cai",
      ledger: "4q2s2-oqaaa-aaaaq-aaaya-cai",
      index: "46y7s-vaaaa-aaaaq-aaaza-cai",
      governance: "6nh4s-5yaaa-aaaaq-aaaxq-cai",
      dapps: [],
      archives: [],
    },
    meta: {
      url: "https://yadjb-mqaaa-aaaan-qaqlq-cai.raw.ic0.app/",
      name: "ICGhost",
      description: "The First Decentralized Meme Coin on IC",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 4,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "6kg2g-qaaaa-aaaaq-aaaxa-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "acdna-os33q-vqq75-tjwg2-kodzo-67zbv-b5t4q-b6p4d-huohg-kaqk4-cae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 1000000000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "4q2s2-oqaaa-aaaaq-aaaya-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "6nh4s-5yaaa-aaaaq-aaaxq-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: null,
        open_sns_token_swap_proposal_id: null,
        decentralization_sale_open_timestamp_seconds: null,
      },
      derived: { buyer_total_icp_e8s: 0, sns_tokens_per_icp: 0.0 },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "GHOST" }],
      ["icrc1:symbol", { Text: "GHOST" }],
      ["icrc1:fee", { Nat: [100000000] }],
    ],
    icrc1_fee: [100000000],
    icrc1_total_supply: 1000000000000000000,
    swap_params: { params: null },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "6kg2g-qaaaa-aaaaq-aaaxa-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "acdna-os33q-vqq75-tjwg2-kodzo-67zbv-b5t4q-b6p4d-huohg-kaqk4-cae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 1000000000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "4q2s2-oqaaa-aaaaq-aaaya-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "6nh4s-5yaaa-aaaaq-aaaxq-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 0.0,
      buyer_total_icp_e8s: 0,
      cf_participant_count: 0,
      direct_participant_count: 0,
      cf_neuron_count: 0,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: null,
      lifecycle: 4,
    },
  },
  {
    index: 6,
    canister_ids: {
      root_canister_id: "4m6il-zqaaa-aaaaq-aaa2a-cai",
      governance_canister_id: "4l7o7-uiaaa-aaaaq-aaa2q-cai",
      index_canister_id: "5ithz-aqaaa-aaaaq-aaa4a-cai",
      swap_canister_id: "4f5dx-pyaaa-aaaaq-aaa3q-cai",
      ledger_canister_id: "4c4fd-caaaa-aaaaq-aaa3a-cai",
    },
    list_sns_canisters: {
      root: "4m6il-zqaaa-aaaaq-aaa2a-cai",
      swap: "4f5dx-pyaaa-aaaaq-aaa3q-cai",
      ledger: "4c4fd-caaaa-aaaaq-aaa3a-cai",
      index: "5ithz-aqaaa-aaaaq-aaa4a-cai",
      governance: "4l7o7-uiaaa-aaaaq-aaa2q-cai",
      dapps: [],
      archives: ["52vqa-maaaa-aaaaq-aaa7a-cai"],
    },
    meta: {
      url: "https://yadjb-mqaaa-aaaan-qaqlq-cai.raw.ic0.app/",
      name: "ICGhost",
      description: "The First Decentralized Meme Coin on IC",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 3,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "4m6il-zqaaa-aaaaq-aaa2a-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "acdna-os33q-vqq75-tjwg2-kodzo-67zbv-b5t4q-b6p4d-huohg-kaqk4-cae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 1000000000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "4c4fd-caaaa-aaaaq-aaa3a-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "4l7o7-uiaaa-aaaaq-aaa2q-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: {
          min_participant_icp_e8s: 100000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 2592000,
            count: 2,
          },
          max_icp_e8s: 2000000000000,
          swap_due_timestamp_seconds: 1690462231,
          min_participants: 200,
          sns_token_e8s: 200000000000000000,
          sale_delay_seconds: null,
          max_participant_icp_e8s: 5000000000,
          min_icp_e8s: 1000000000000,
        },
        open_sns_token_swap_proposal_id: 123592,
        decentralization_sale_open_timestamp_seconds: 1690203041,
      },
      derived: {
        buyer_total_icp_e8s: 2000000000000,
        sns_tokens_per_icp: 100000.0,
      },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "GHOST" }],
      ["icrc1:symbol", { Text: "GHOST" }],
      ["icrc1:fee", { Nat: [100000000] }],
    ],
    icrc1_fee: [100000000],
    icrc1_total_supply: 999999169800000000,
    swap_params: {
      params: {
        min_participant_icp_e8s: 100000000,
        neuron_basket_construction_parameters: {
          dissolve_delay_interval_seconds: 2592000,
          count: 2,
        },
        max_icp_e8s: 2000000000000,
        swap_due_timestamp_seconds: 1690462231,
        min_participants: 200,
        sns_token_e8s: 200000000000000000,
        sale_delay_seconds: null,
        max_participant_icp_e8s: 5000000000,
        min_icp_e8s: 1000000000000,
      },
    },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "4m6il-zqaaa-aaaaq-aaa2a-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "acdna-os33q-vqq75-tjwg2-kodzo-67zbv-b5t4q-b6p4d-huohg-kaqk4-cae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 1000000000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "4c4fd-caaaa-aaaaq-aaa3a-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "4l7o7-uiaaa-aaaaq-aaa2q-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 100000.0,
      buyer_total_icp_e8s: 2000000000000,
      cf_participant_count: 0,
      direct_participant_count: 586,
      cf_neuron_count: 0,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: 1690203041,
      lifecycle: 3,
    },
  },
  {
    index: 7,
    canister_ids: {
      root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
      governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
      index_canister_id: "5tw34-2iaaa-aaaaq-aaa6q-cai",
      swap_canister_id: "5ux5i-xqaaa-aaaaq-aaa6a-cai",
      ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
    },
    list_sns_canisters: {
      root: "5psbn-niaaa-aaaaq-aaa4q-cai",
      swap: "5ux5i-xqaaa-aaaaq-aaa6a-cai",
      ledger: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
      index: "5tw34-2iaaa-aaaaq-aaa6q-cai",
      governance: "5grkr-3aaaa-aaaaq-aaa5a-cai",
      dapps: [
        "7xnbj-wqaaa-aaaap-aa4ea-cai",
        "5escj-6iaaa-aaaap-aa4kq-cai",
        "443xk-qiaaa-aaaap-aa4oq-cai",
        "4sz2c-lyaaa-aaaap-aa4pq-cai",
        "zjdgt-niaaa-aaaap-aa4qq-cai",
        "zhbl3-wyaaa-aaaap-aa4rq-cai",
      ],
      archives: [],
    },
    meta: {
      url: "https://catalyze.one",
      name: "Catalyze",
      description:
        "Catalyze is a one-stop social-fi application for organising your Web3 experience",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 2,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
            "efaeg-aiaaa-aaaap-aan6a-cai",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 400000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
          restricted_countries: { iso_codes: ["US"] },
          min_icp_e8s: null,
        },
        params: {
          min_participant_icp_e8s: 100000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 5259486,
            count: 7,
          },
          max_icp_e8s: 130000000000000,
          swap_due_timestamp_seconds: 1691785258,
          min_participants: 125,
          sns_token_e8s: 11250000000000000,
          sale_delay_seconds: null,
          max_participant_icp_e8s: 15000000000000,
          min_icp_e8s: 65000000000000,
        },
        open_sns_token_swap_proposal_id: 123772,
        decentralization_sale_open_timestamp_seconds: 1690786778,
      },
      derived: {
        buyer_total_icp_e8s: 50669291278205,
        sns_tokens_per_icp: 222.02797,
      },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "CatalyzeDAO" }],
      ["icrc1:symbol", { Text: "CAT" }],
      ["icrc1:fee", { Nat: [100000] }],
    ],
    icrc1_fee: [100000],
    icrc1_total_supply: 50000000000000000,
    swap_params: {
      params: {
        min_participant_icp_e8s: 100000000,
        neuron_basket_construction_parameters: {
          dissolve_delay_interval_seconds: 5259486,
          count: 7,
        },
        max_icp_e8s: 130000000000000,
        swap_due_timestamp_seconds: 1691785258,
        min_participants: 125,
        sns_token_e8s: 11250000000000000,
        sale_delay_seconds: null,
        max_participant_icp_e8s: 15000000000000,
        min_icp_e8s: 65000000000000,
      },
    },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
          "efaeg-aiaaa-aaaap-aan6a-cai",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 400000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
        restricted_countries: { iso_codes: ["US"] },
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 222.02796936035156,
      buyer_total_icp_e8s: 50669291278205,
      cf_participant_count: 145,
      direct_participant_count: 224,
      cf_neuron_count: 178,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: 1690786778,
      lifecycle: 2,
    },
  },
  {
    index: 8,
    canister_ids: {
      root_canister_id: "55uwu-byaaa-aaaaq-aaa7q-cai",
      governance_canister_id: "wdcek-2qaaa-aaaaq-aabaa-cai",
      index_canister_id: "wkbpw-myaaa-aaaaq-aabbq-cai",
      swap_canister_id: "wnajc-baaaa-aaaaq-aabba-cai",
      ledger_canister_id: "wedc6-xiaaa-aaaaq-aabaq-cai",
    },
    list_sns_canisters: {
      root: "55uwu-byaaa-aaaaq-aaa7q-cai",
      swap: "wnajc-baaaa-aaaaq-aabba-cai",
      ledger: "wedc6-xiaaa-aaaaq-aabaq-cai",
      index: "wkbpw-myaaa-aaaaq-aabbq-cai",
      governance: "wdcek-2qaaa-aaaaq-aabaa-cai",
      dapps: [],
      archives: [],
    },
    meta: {
      url: "https://edgematrix.pro/",
      name: "Edge Matrix Computing",
      description:
        "The Next Generation of Decentralized Computing Network in AI Era",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 1,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "55uwu-byaaa-aaaaq-aaa7q-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: ["htsl7-baaaa-aaaam-ablva-cai"],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 100000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "wedc6-xiaaa-aaaaq-aabaq-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "wdcek-2qaaa-aaaaq-aabaa-cai",
          restricted_countries: null,
          min_icp_e8s: null,
        },
        params: null,
        open_sns_token_swap_proposal_id: null,
        decentralization_sale_open_timestamp_seconds: null,
      },
      derived: { buyer_total_icp_e8s: 0, sns_tokens_per_icp: 0.0 },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "EdgeMatrixComputing" }],
      ["icrc1:symbol", { Text: "EMC" }],
      ["icrc1:fee", { Nat: [100000] }],
    ],
    icrc1_fee: [100000],
    icrc1_total_supply: 210000000000000000,
    swap_params: { params: null },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "55uwu-byaaa-aaaaq-aaa7q-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: ["htsl7-baaaa-aaaam-ablva-cai"],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 100000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 100000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "wedc6-xiaaa-aaaaq-aabaq-cai",
        neurons_fund_participants: null,
        should_auto_finalize: null,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "wdcek-2qaaa-aaaaq-aabaa-cai",
        restricted_countries: null,
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 0.0,
      buyer_total_icp_e8s: 0,
      cf_participant_count: 0,
      direct_participant_count: 0,
      cf_neuron_count: 0,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: null,
      lifecycle: 1,
    },
  },
  {
    index: 9,
    canister_ids: {
      root_canister_id: "w7g63-nqaaa-aaaaq-aabca-cai",
      governance_canister_id: "wyhyp-aiaaa-aaaaq-aabcq-cai",
      index_canister_id: "x3lrj-uqaaa-aaaaq-aabea-cai",
      swap_canister_id: "wwfvh-3yaaa-aaaaq-aabdq-cai",
      ledger_canister_id: "wrett-waaaa-aaaaq-aabda-cai",
    },
    list_sns_canisters: {
      root: "w7g63-nqaaa-aaaaq-aabca-cai",
      swap: "wwfvh-3yaaa-aaaaq-aabdq-cai",
      ledger: "wrett-waaaa-aaaaq-aabda-cai",
      index: "x3lrj-uqaaa-aaaaq-aabea-cai",
      governance: "wyhyp-aiaaa-aaaaq-aabcq-cai",
      dapps: [
        "gdtip-xiaaa-aaaah-qdbnq-cai",
        "gwuzc-waaaa-aaaah-qdboa-cai",
        "grv7w-3yaaa-aaaah-qdboq-cai",
        "g7xs6-aiaaa-aaaah-qdbpq-cai",
        "ddmi3-laaaa-aaaah-qdbqa-cai",
      ],
      archives: [],
    },
    meta: {
      url: "https://modclub.app",
      name: "Modclub",
      description:
        "Modclub is a decentralized crowdwork platform built on the IC that aims to support dApps by handing resource-intensive tasks such as moderation, user verification and data labeling.",
    },
    parameters: {
      reserved_ids: [],
      functions: [
        {
          id: 0,
          name: "All Topics",
          description:
            "Catch-all w.r.t to following for all types of proposals.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 1,
          name: "Motion",
          description:
            "Side-effect-less proposals to set general governance direction.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 2,
          name: "Manage nervous system parameters",
          description:
            "Proposal to change the core parameters of SNS governance.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 3,
          name: "Upgrade SNS controlled canister",
          description:
            "Proposal to upgrade the wasm of an SNS controlled canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 4,
          name: "Add nervous system function",
          description:
            "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 5,
          name: "Remove nervous system function",
          description:
            "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 6,
          name: "Execute nervous system function",
          description:
            "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 7,
          name: "Upgrade SNS to next version",
          description: "Proposal to upgrade the WASM of a core SNS canister.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 8,
          name: "Manage SNS metadata",
          description:
            "Proposal to change the metadata associated with an SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 9,
          name: "Transfer SNS treasury funds",
          description:
            "Proposal to transfer funds from an SNS Governance controlled treasury account",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 10,
          name: "Register dapp canisters",
          description: "Proposal to register a dapp canister with the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
        {
          id: 11,
          name: "Deregister Dapp Canisters",
          description:
            "Proposal to deregister a previously-registered dapp canister from the SNS.",
          function_type: { NativeNervousSystemFunction: {} },
        },
      ],
    },
    swap_state: {
      swap: {
        lifecycle: 1,
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "w7g63-nqaaa-aaaaq-aabca-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "d2qpe-l63sh-47jxj-2764e-pa6i7-qocm4-icuie-nt2lb-yiwwk-bmq7z-pqe",
            "3v3rk-jx25f-dl43p-osgkw-6dm7b-wguwy-kjcun-lyo3w-lsuev-kcdnp-7qe",
            "upgqi-bms4w-gza6f-xgl4l-b7plh-xyyjx-ahmcn-ocnv6-cfio4-53j6g-4ae",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 3600000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 10000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "wrett-waaaa-aaaaq-aabda-cai",
          neurons_fund_participants: null,
          should_auto_finalize: true,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "wyhyp-aiaaa-aaaaq-aabcq-cai",
          restricted_countries: { iso_codes: ["US"] },
          min_icp_e8s: null,
        },
        params: null,
        open_sns_token_swap_proposal_id: null,
        decentralization_sale_open_timestamp_seconds: null,
      },
      derived: { buyer_total_icp_e8s: 0, sns_tokens_per_icp: 0.0 },
    },
    icrc1_metadata: [
      ["icrc1:decimals", { Nat: [8] }],
      ["icrc1:name", { Text: "Modclub" }],
      ["icrc1:symbol", { Text: "MOD" }],
      ["icrc1:fee", { Nat: [10000] }],
    ],
    icrc1_fee: [10000],
    icrc1_total_supply: 97999996400000000,
    swap_params: { params: null },
    init: {
      init: {
        nns_proposal_id: null,
        sns_root_canister_id: "w7g63-nqaaa-aaaaq-aabca-cai",
        min_participant_icp_e8s: null,
        neuron_basket_construction_parameters: null,
        fallback_controller_principal_ids: [
          "d2qpe-l63sh-47jxj-2764e-pa6i7-qocm4-icuie-nt2lb-yiwwk-bmq7z-pqe",
          "3v3rk-jx25f-dl43p-osgkw-6dm7b-wguwy-kjcun-lyo3w-lsuev-kcdnp-7qe",
          "upgqi-bms4w-gza6f-xgl4l-b7plh-xyyjx-ahmcn-ocnv6-cfio4-53j6g-4ae",
        ],
        max_icp_e8s: null,
        neuron_minimum_stake_e8s: 3600000000,
        confirmation_text: null,
        swap_start_timestamp_seconds: null,
        swap_due_timestamp_seconds: null,
        min_participants: null,
        sns_token_e8s: null,
        nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
        transaction_fee_e8s: 10000,
        icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        sns_ledger_canister_id: "wrett-waaaa-aaaaq-aabda-cai",
        neurons_fund_participants: null,
        should_auto_finalize: true,
        max_participant_icp_e8s: null,
        sns_governance_canister_id: "wyhyp-aiaaa-aaaaq-aabcq-cai",
        restricted_countries: { iso_codes: ["US"] },
        min_icp_e8s: null,
      },
    },
    derived_state: {
      sns_tokens_per_icp: 0.0,
      buyer_total_icp_e8s: 0,
      cf_participant_count: 0,
      direct_participant_count: 0,
      cf_neuron_count: 0,
    },
    lifecycle: {
      decentralization_sale_open_timestamp_seconds: null,
      lifecycle: 1,
    },
  },
];

const data: CachedSnsDto[];
export default data;
