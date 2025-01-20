use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref LOCK: Mutex<()> = Mutex::new(());
}

#[allow(clippy::unused_async)]
pub async fn sync_transactions() -> Option<Result<u32, String>> {
    None
}
