use crate::proposals::tests::payloads::nns_function_02::payload_45339;
use crate::proposals::tests::payloads::nns_function_04::payload_44955;
use crate::proposals::tests::payloads::nns_function_05::payload_45091;
use crate::proposals::tests::payloads::nns_function_07::payload_45543;
use crate::proposals::tests::payloads::nns_function_10::payload_45372;
use crate::proposals::tests::payloads::nns_function_11::payload_45343;
use crate::proposals::tests::payloads::nns_function_13::payload_43630;
use crate::proposals::tests::payloads::nns_function_16::payload_44876;
use crate::proposals::tests::payloads::nns_function_20::payload_44877;
use crate::proposals::tests::payloads::nns_function_21::payload_43825;
use crate::proposals::tests::payloads::nns_function_23::payload_44892;

mod nns_function_02;
mod nns_function_04;
mod nns_function_05;
mod nns_function_07;
mod nns_function_10;
mod nns_function_11;
mod nns_function_13;
mod nns_function_16;
mod nns_function_20;
mod nns_function_21;
mod nns_function_23;

pub fn get_payloads() -> Vec<(i32, Vec<u8>)> {
    vec![
        // (1, ???),
        (2, payload_45339()),
        // (3, ???),
        (4, payload_44955()),
        (5, payload_45091()),
        // (6, ???),
        (7, payload_45543()),
        // (8, ???),
        // (9, ???),
        (10, payload_45372()),
        (11, payload_45343()),
        // (12, ???),
        (13, payload_43630()),
        // (14, ???),
        // (15, ???),
        (16, payload_44876()),
        // (17, ???),
        // (18, ???),
        // (19, ???),
        (20, payload_44877()),
        (21, payload_43825()),
        // (22, ???),
        (23, payload_44892()),
        // (24, ???),
    ]
}
