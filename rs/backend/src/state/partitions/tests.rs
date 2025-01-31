//! Tests for stable memory layout code.
use super::*;
use ic_cdk::api::stable::WASM_PAGE_SIZE_IN_BYTES;
use pretty_assertions::assert_eq;
use std::rc::Rc;

/// The virtual memory in a partition table should correspond to that created by a memory manager.
#[test]
fn partitions_should_get_correct_virtual_memory() {
    /// Checks that the contents of virtual memory is as we expect.
    fn should_contain(partitions: &Partitions, memory_id: MemoryId, expected_contents: &[u8]) {
        let memory = partitions.get(memory_id);
        let mut actual_contents = vec![0u8; expected_contents.len()];
        memory.read(0, &mut actual_contents);
        assert_eq!(
            expected_contents, actual_contents,
            "Partition {:?} should contain the expected contents.",
            memory_id
        );
    }

    // Prepare some memory.
    let toy_memory = DefaultMemoryImpl::default();
    let memory_manager = MemoryManager::init(Rc::clone(&toy_memory));
    // At this stage, partitions should be empty.
    let partitions = Partitions::from(Rc::clone(&toy_memory));
    assert_eq!(
        partitions.get(PartitionType::Metadata.memory_id()).size(),
        0,
        "Metadata partition should be empty."
    );
    assert_eq!(
        partitions.get(PartitionType::Heap.memory_id()).size(),
        0,
        "Heap partition should be empty."
    );

    // Grow a partition in the memory manager.  The partitions should grow with it.
    let toy_metadata_fill = [9u8; WASM_PAGE_SIZE_IN_BYTES as usize];
    memory_manager.get(PartitionType::Metadata.memory_id()).grow(1);
    let partitions = Partitions::from(Rc::clone(&toy_memory));
    assert_eq!(
        Partitions::from(Rc::clone(&toy_memory))
            .get(PartitionType::Metadata.memory_id())
            .size(),
        1,
        "Metadata partition should have grown to 1."
    );
    assert_eq!(
        partitions.get(PartitionType::Heap.memory_id()).size(),
        0,
        "Heap partition should still be empty."
    );

    // Populate a partition with the memory manager.  The partitions should be able to read the data back.
    memory_manager
        .get(PartitionType::Metadata.memory_id())
        .write(0, &toy_metadata_fill);
    let partitions = Partitions::from(Rc::clone(&toy_memory));
    assert_eq!(
        partitions.get(PartitionType::Metadata.memory_id()).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        partitions.get(PartitionType::Heap.memory_id()).size(),
        0,
        "Heap partition should still be empty."
    );
    should_contain(&partitions, PartitionType::Metadata.memory_id(), &toy_metadata_fill);

    // Populate another partition via partitions.  The memory manager should reflect the change.
    let toy_heap_fill = b"bar".repeat(1000);
    memory_manager.get(PartitionType::Heap.memory_id()).grow(2);
    let partitions = Partitions::from(Rc::clone(&toy_memory));
    assert_eq!(
        memory_manager.get(PartitionType::Metadata.memory_id()).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        memory_manager.get(PartitionType::Heap.memory_id()).size(),
        2,
        "Heap partition should have grown to 2."
    );
    partitions
        .get(PartitionType::Heap.memory_id())
        .write(0, &toy_heap_fill[..]);
    assert_eq!(
        memory_manager.get(PartitionType::Metadata.memory_id()).size(),
        1,
        "Metadata partition should still be 1."
    );
    assert_eq!(
        memory_manager.get(PartitionType::Heap.memory_id()).size(),
        2,
        "Heap partition should still be 2."
    );
    // Basic sanity check seems OK!
}

#[derive(Debug, Clone)]
struct GrowingWriteTestVector {
    initial_memory_pages: u64,
    write_offset: u64,
    buffer: Vec<u8>,
    expected_final_memory_pages: u64,
}

fn growing_write_test_vectors() -> Vec<GrowingWriteTestVector> {
    vec![
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 0,
            buffer: vec![],
            expected_final_memory_pages: 0,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 1,
            buffer: vec![],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: WASM_PAGE_SIZE_IN_BYTES,
            buffer: vec![],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: (WASM_PAGE_SIZE_IN_BYTES) + 1,
            buffer: vec![],
            expected_final_memory_pages: 2,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 0,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: 1,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: WASM_PAGE_SIZE_IN_BYTES - 4,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 1,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: (WASM_PAGE_SIZE_IN_BYTES) - 3,
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 2,
        },
        GrowingWriteTestVector {
            initial_memory_pages: 0,
            write_offset: (WASM_PAGE_SIZE_IN_BYTES),
            buffer: vec![1, 2, 3, 4],
            expected_final_memory_pages: 2,
        },
    ]
}

fn growing_write_should_work(memory_id: MemoryId, test_vector: &GrowingWriteTestVector) {
    let GrowingWriteTestVector {
        initial_memory_pages,
        write_offset,
        buffer,
        expected_final_memory_pages,
    } = test_vector;
    let toy_memory = DefaultMemoryImpl::default();
    MemoryManager::init(Rc::clone(&toy_memory));
    let partitions = Partitions::from(Rc::clone(&toy_memory));
    partitions.get(memory_id).grow(*initial_memory_pages);
    assert_eq!(
        partitions.get(memory_id).size(),
        *initial_memory_pages,
        "Test setup error: Initial memory size should be as expected for test vector: {:?} {:?}",
        memory_id,
        test_vector
    );
    partitions.growing_write(memory_id, *write_offset, buffer.as_slice());
    assert_eq!(
        partitions.get(memory_id).size(),
        *expected_final_memory_pages,
        "growing_write did not leave the final memory size as expected for test vector: {:?} {:?}",
        memory_id,
        test_vector
    );
    let mut read_buffer = vec![0u8; buffer.len()];
    partitions.get(memory_id).read(*write_offset, &mut read_buffer);
    assert_eq!(
        read_buffer, *buffer,
        "growing_write did not write the expected data for test vector: {:?} {:?}",
        memory_id, test_vector
    );
}

#[test]
fn growing_write_should_work_for_all() {
    for memory_id in [PartitionType::Metadata.memory_id(), PartitionType::Accounts.memory_id()] {
        for test_vector in growing_write_test_vectors() {
            growing_write_should_work(memory_id, &test_vector);
        }
    }
}

#[test]
fn debug_should_portray_partitions_accurately() {
    let partitions = Partitions::from(DefaultMemoryImpl::default());
    partitions.get(PartitionType::Metadata.memory_id()).grow(5); // Has one page already, storing the schema label.  Increase this to 6.
    partitions.get(PartitionType::Accounts.memory_id()).grow(2);
    assert_eq!(
        format!("{:?}", partitions),
        "Partitions {\n  Metadata partition: 5 pages\n  Heap partition: 0 pages\n  Accounts partition: 2 pages\n}\n"
    );
}

#[test]
fn write_to_and_read_from_managed_memory_should_work() {
    let partitions = Partitions::from(DefaultMemoryImpl::default());

    // Reading a previously written buffer should return the same bytes.
    let toy_bytes = b"foo_bar".to_vec();
    partitions.write_bytes_to_managed_memory(&toy_bytes);
    let read_bytes = partitions.read_bytes_from_managed_memory();
    assert_eq!(read_bytes, toy_bytes, "Managed memory read did not return the expected bytes.");

    // Reading a previously written buffer should return the same bytes, when the buffer is smaller.
    let toy_bytes = b"foo".to_vec();
    partitions.write_bytes_to_managed_memory(&toy_bytes);
    let read_bytes = partitions.read_bytes_from_managed_memory();
    assert_eq!(read_bytes, toy_bytes, "Managed memory read did not return the expected bytes.");

    // Reading a previously written buffer should return the same bytes, when the buffer is larger.
    let toy_bytes = b"foo_bar".to_vec();
    partitions.write_bytes_to_managed_memory(&toy_bytes);
    let read_bytes = partitions.read_bytes_from_managed_memory();
    assert_eq!(read_bytes, toy_bytes, "Managed memory read did not return the expected bytes.");
}