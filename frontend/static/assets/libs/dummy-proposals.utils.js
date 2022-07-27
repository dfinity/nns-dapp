// Taken from proposal 22690
const addNodeToSubnetPayload = new Uint8Array([
  68, 73, 68, 76, 2, 108, 2, 189, 134, 157, 139, 4, 104, 187, 248, 253, 237, 15,
  1, 109, 104, 1, 0, 1, 29, 48, 88, 10, 26, 118, 67, 4, 149, 19, 248, 247, 214,
  255, 230, 245, 16, 0, 87, 3, 69, 166, 49, 96, 202, 183, 120, 76, 89, 2, 6, 1,
  29, 51, 220, 137, 254, 80, 65, 97, 181, 128, 157, 164, 206, 198, 201, 192,
  116, 92, 173, 184, 210, 144, 204, 206, 121, 81, 13, 196, 148, 2, 1, 29, 62,
  91, 49, 39, 31, 78, 249, 101, 42, 251, 98, 132, 35, 89, 47, 167, 85, 234, 194,
  190, 198, 85, 248, 43, 205, 227, 7, 240, 2, 1, 29, 189, 179, 150, 208, 32,
  136, 253, 97, 98, 29, 125, 252, 114, 252, 135, 108, 64, 228, 17, 155, 56, 110,
  6, 209, 10, 58, 143, 250, 2, 1, 29, 83, 14, 206, 84, 1, 52, 115, 72, 105, 57,
  196, 135, 45, 191, 46, 40, 223, 245, 4, 84, 85, 11, 224, 139, 79, 204, 167,
  152, 2, 1, 29, 215, 173, 15, 73, 221, 103, 119, 194, 136, 56, 137, 28, 92,
  142, 200, 175, 27, 120, 60, 151, 12, 7, 18, 70, 49, 245, 101, 10, 2, 1, 29,
  107, 187, 11, 92, 235, 63, 72, 68, 146, 137, 68, 173, 47, 217, 208, 29, 198,
  86, 163, 58, 31, 67, 15, 163, 102, 110, 232, 11, 2,
]);

// Taken from payload 22955
const updateSubnetPayload = new Uint8Array([
  68, 73, 68, 76, 1, 108, 2, 189, 134, 157, 139, 4, 104, 201, 239, 142, 197, 9,
  113, 1, 0, 1, 29, 106, 143, 103, 216, 110, 204, 131, 7, 4, 128, 56, 173, 113,
  89, 148, 88, 193, 49, 181, 49, 220, 155, 176, 182, 145, 148, 13, 185, 2, 40,
  51, 101, 97, 102, 56, 53, 52, 49, 99, 51, 56, 57, 98, 97, 100, 98, 100, 54,
  99, 100, 53, 48, 102, 102, 102, 51, 49, 101, 49, 53, 56, 53, 48, 53, 102, 52,
  52, 56, 55, 100,
]);

const updateSubnetConfigPayload = new Uint8Array([
  68, 73, 68, 76, 10, 108, 28, 157, 188, 214, 5, 1, 140, 222, 255, 11, 2, 205,
  168, 240, 102, 1, 253, 217, 221, 150, 1, 3, 135, 210, 149, 176, 1, 126, 134,
  159, 150, 194, 1, 1, 200, 139, 164, 208, 3, 2, 189, 134, 157, 139, 4, 104,
  236, 160, 183, 153, 4, 1, 200, 132, 169, 172, 4, 1, 191, 183, 152, 241, 4, 1,
  242, 143, 178, 248, 4, 1, 163, 193, 142, 141, 5, 5, 213, 182, 238, 222, 5, 5,
  159, 156, 146, 151, 8, 1, 253, 166, 177, 136, 9, 2, 190, 189, 191, 246, 10, 2,
  225, 162, 150, 151, 11, 1, 230, 186, 175, 172, 12, 2, 131, 242, 191, 191, 12,
  2, 145, 147, 167, 203, 12, 2, 202, 194, 213, 231, 12, 6, 175, 204, 186, 245,
  12, 1, 142, 144, 239, 245, 12, 2, 209, 248, 252, 181, 13, 1, 194, 183, 251,
  250, 13, 2, 156, 237, 135, 156, 14, 8, 138, 148, 209, 203, 14, 6, 110, 120,
  110, 121, 110, 4, 108, 2, 211, 170, 190, 246, 2, 126, 198, 255, 196, 202, 15,
  126, 110, 126, 110, 7, 109, 113, 110, 9, 107, 3, 208, 214, 250, 209, 2, 127,
  217, 154, 186, 234, 2, 127, 239, 173, 138, 151, 15, 127, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 1, 29, 207, 242, 128, 227, 45, 127, 92, 205, 34, 70, 136, 47, 148, 175,
  178, 15, 84, 202, 97, 162, 23, 101, 231, 18, 212, 61, 39, 137, 2, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 102, 115, 115, 104, 45, 101, 100, 50, 53, 53,
  49, 57, 32, 65, 65, 65, 65, 67, 51, 78, 122, 97, 67, 49, 108, 90, 68, 73, 49,
  78, 84, 69, 53, 65, 65, 65, 65, 73, 69, 86, 99, 98, 89, 121, 87, 57, 67, 65,
  83, 97, 73, 97, 56, 119, 104, 48, 55, 68, 118, 109, 53, 100, 67, 101, 104, 48,
  80, 47, 89, 103, 82, 80, 57, 75, 119, 114, 51, 56, 103, 66, 53, 32, 99, 111,
  110, 115, 101, 110, 115, 117, 115, 64, 49, 48, 46, 51, 49, 46, 48, 46, 49, 52,
  49, 96, 115, 115, 104, 45, 101, 100, 50, 53, 53, 49, 57, 32, 65, 65, 65, 65,
  67, 51, 78, 122, 97, 67, 49, 108, 90, 68, 73, 49, 78, 84, 69, 53, 65, 65, 65,
  65, 73, 67, 115, 79, 50, 73, 69, 86, 57, 54, 116, 79, 86, 102, 106, 111, 79,
  106, 52, 53, 48, 84, 90, 114, 52, 77, 68, 56, 80, 97, 117, 72, 113, 104, 99,
  76, 89, 118, 114, 109, 82, 82, 117, 101, 32, 112, 102, 111, 112, 115, 64, 115,
  102, 49, 45, 115, 112, 109, 49, 50, 89, 115, 115, 104, 45, 101, 100, 50, 53,
  53, 49, 57, 32, 65, 65, 65, 65, 67, 51, 78, 122, 97, 67, 49, 108, 90, 68, 73,
  49, 78, 84, 69, 53, 65, 65, 65, 65, 73, 77, 122, 55, 53, 84, 121, 106, 115,
  108, 54, 103, 120, 79, 74, 122, 48, 122, 72, 73, 118, 99, 81, 99, 77, 113,
  117, 73, 109, 55, 68, 72, 66, 66, 54, 50, 82, 101, 74, 98, 82, 107, 107, 57,
  32, 111, 112, 64, 112, 121, 114, 48, 55, 0, 0, 0, 0, 0, 0,
]);

// Taken from payload 43825
const addOrRemoveDataCentersPayload = new Uint8Array([
  68, 73, 68, 76, 6, 108, 2, 179, 128, 187, 160, 15, 1, 242, 202, 249, 200, 15,
  5, 109, 2, 108, 4, 219, 183, 1, 113, 170, 148, 186, 2, 3, 244, 129, 179, 4,
  113, 179, 176, 218, 195, 3, 113, 110, 4, 108, 2, 236, 142, 163, 51, 115, 175,
  130, 175, 206, 9, 115, 109, 113, 1, 0, 63, 3, 97, 110, 49, 1, 170, 224, 76,
  66, 72, 225, 140, 64, 18, 69, 117, 114, 111, 112, 101, 44, 66, 69, 44, 70,
  108, 97, 110, 100, 101, 114, 115, 17, 68, 97, 116, 97, 99, 101, 110, 116, 101,
  114, 32, 85, 110, 105, 116, 101, 100, 3, 97, 116, 49, 1, 211, 188, 6, 66, 150,
  195, 168, 194, 24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97,
  44, 85, 83, 44, 71, 101, 111, 114, 103, 105, 97, 10, 70, 108, 101, 120, 101,
  110, 116, 105, 97, 108, 3, 97, 116, 50, 1, 162, 69, 7, 66, 240, 199, 168, 194,
  24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83,
  44, 71, 101, 111, 114, 103, 105, 97, 8, 68, 97, 116, 97, 115, 105, 116, 101,
  3, 97, 119, 49, 1, 167, 104, 34, 66, 65, 241, 150, 194, 29, 78, 111, 114, 116,
  104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 80, 101, 110, 110,
  115, 121, 108, 118, 97, 110, 105, 97, 9, 84, 105, 101, 114, 112, 111, 105,
  110, 116, 3, 98, 99, 49, 1, 34, 14, 69, 66, 157, 96, 246, 194, 33, 78, 111,
  114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 67, 65, 44, 66, 114,
  105, 116, 105, 115, 104, 32, 67, 111, 108, 117, 109, 98, 105, 97, 7, 67, 121,
  120, 116, 101, 114, 97, 3, 98, 114, 49, 1, 186, 90, 75, 66, 184, 30, 139, 64,
  26, 69, 117, 114, 111, 112, 101, 44, 66, 69, 44, 66, 114, 117, 115, 115, 101,
  108, 115, 32, 67, 97, 112, 105, 116, 97, 108, 14, 68, 105, 103, 105, 116, 97,
  108, 32, 82, 101, 97, 108, 116, 121, 3, 98, 114, 50, 1, 172, 109, 75, 66, 113,
  27, 139, 64, 26, 69, 117, 114, 111, 112, 101, 44, 66, 69, 44, 66, 114, 117,
  115, 115, 101, 108, 115, 32, 67, 97, 112, 105, 116, 97, 108, 9, 65, 116, 108,
  97, 115, 69, 100, 103, 101, 3, 98, 117, 49, 1, 11, 181, 49, 66, 236, 209, 208,
  65, 19, 69, 117, 114, 111, 112, 101, 44, 82, 79, 44, 66, 117, 99, 117, 114,
  101, 115, 116, 105, 5, 77, 50, 52, 55, 32, 3, 99, 104, 50, 1, 196, 229, 39,
  66, 40, 94, 175, 194, 25, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105,
  99, 97, 44, 85, 83, 44, 73, 108, 108, 105, 110, 111, 105, 115, 9, 84, 105,
  101, 114, 112, 111, 105, 110, 116, 3, 99, 104, 51, 1, 34, 189, 39, 66, 185,
  141, 175, 194, 25, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97,
  44, 85, 83, 44, 73, 108, 108, 105, 110, 111, 105, 115, 8, 67, 121, 114, 117,
  115, 79, 110, 101, 3, 100, 108, 49, 1, 87, 27, 3, 66, 16, 152, 193, 194, 22,
  78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44,
  84, 101, 120, 97, 115, 10, 70, 108, 101, 120, 101, 110, 116, 105, 97, 108, 3,
  102, 109, 49, 1, 170, 49, 22, 66, 42, 250, 243, 194, 27, 78, 111, 114, 116,
  104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 67, 97, 108, 105,
  102, 111, 114, 110, 105, 97, 18, 72, 117, 114, 114, 105, 99, 97, 110, 101, 32,
  69, 108, 101, 99, 116, 114, 105, 99, 3, 102, 114, 50, 1, 60, 125, 72, 66, 90,
  158, 10, 65, 15, 69, 117, 114, 111, 112, 101, 44, 68, 69, 44, 72, 101, 115,
  115, 101, 7, 69, 113, 117, 105, 110, 105, 120, 3, 103, 101, 49, 1, 78, 209,
  56, 66, 24, 149, 196, 64, 16, 69, 117, 114, 111, 112, 101, 44, 67, 72, 44, 71,
  101, 110, 101, 118, 97, 6, 72, 105, 103, 104, 68, 67, 3, 103, 101, 50, 1, 14,
  207, 56, 66, 104, 92, 196, 64, 16, 69, 117, 114, 111, 112, 101, 44, 67, 72,
  44, 71, 101, 110, 101, 118, 97, 8, 83, 97, 102, 101, 72, 111, 115, 116, 3,
  104, 117, 49, 1, 28, 235, 237, 65, 232, 202, 190, 194, 22, 78, 111, 114, 116,
  104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 84, 101, 120, 97,
  115, 3, 84, 82, 71, 3, 106, 118, 49, 1, 36, 168, 242, 65, 171, 79, 163, 194,
  24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83,
  44, 70, 108, 111, 114, 105, 100, 97, 9, 84, 105, 101, 114, 112, 111, 105, 110,
  116, 3, 108, 106, 49, 1, 46, 51, 56, 66, 25, 28, 104, 65, 19, 69, 117, 114,
  111, 112, 101, 44, 83, 73, 44, 76, 106, 117, 98, 108, 106, 97, 110, 97, 9, 80,
  111, 115, 105, 116, 97, 46, 115, 105, 3, 108, 118, 49, 1, 236, 81, 16, 66, 10,
  87, 230, 194, 23, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97,
  44, 85, 83, 44, 78, 101, 118, 97, 100, 97, 10, 70, 108, 101, 120, 101, 110,
  116, 105, 97, 108, 3, 109, 98, 49, 1, 7, 59, 58, 66, 81, 84, 122, 65, 17, 69,
  117, 114, 111, 112, 101, 44, 83, 73, 44, 77, 97, 114, 105, 98, 111, 114, 9,
  80, 111, 115, 105, 116, 97, 46, 115, 105, 3, 109, 109, 49, 1, 246, 23, 206,
  65, 52, 98, 160, 194, 24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105,
  99, 97, 44, 85, 83, 44, 70, 108, 111, 114, 105, 100, 97, 14, 68, 105, 103,
  105, 116, 97, 108, 32, 82, 101, 97, 108, 116, 121, 3, 109, 117, 49, 1, 88,
  138, 64, 66, 223, 79, 57, 65, 17, 69, 117, 114, 111, 112, 101, 44, 68, 69, 44,
  66, 97, 118, 97, 114, 105, 97, 8, 113, 46, 98, 101, 121, 111, 110, 100, 3,
  110, 121, 49, 1, 232, 217, 34, 66, 18, 3, 148, 194, 25, 78, 111, 114, 116,
  104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 78, 101, 119, 32, 89,
  111, 114, 107, 9, 84, 105, 101, 114, 112, 111, 105, 110, 116, 3, 111, 114, 49,
  1, 215, 180, 228, 65, 39, 194, 162, 194, 24, 78, 111, 114, 116, 104, 32, 65,
  109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 70, 108, 111, 114, 105, 100, 97,
  8, 68, 97, 116, 97, 115, 105, 116, 101, 3, 112, 104, 49, 1, 41, 203, 5, 66,
  240, 37, 224, 194, 24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99,
  97, 44, 85, 83, 44, 65, 114, 105, 122, 111, 110, 97, 8, 67, 121, 114, 117,
  115, 79, 110, 101, 3, 112, 108, 49, 1, 57, 5, 54, 66, 154, 89, 245, 194, 23,
  78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44,
  79, 114, 101, 103, 111, 110, 10, 70, 108, 101, 120, 101, 110, 116, 105, 97,
  108, 3, 115, 103, 49, 1, 157, 17, 173, 63, 102, 168, 207, 66, 17, 65, 115,
  105, 97, 44, 83, 71, 44, 83, 105, 110, 103, 97, 112, 111, 114, 101, 5, 84,
  101, 108, 105, 110, 3, 115, 103, 50, 1, 4, 86, 166, 63, 102, 168, 207, 66, 17,
  65, 115, 105, 97, 44, 83, 71, 44, 83, 105, 110, 103, 97, 112, 111, 114, 101,
  5, 84, 101, 108, 105, 110, 3, 115, 103, 51, 1, 65, 130, 170, 63, 200, 231,
  207, 66, 17, 65, 115, 105, 97, 44, 83, 71, 44, 83, 105, 110, 103, 97, 112,
  111, 114, 101, 13, 82, 97, 99, 107, 115, 32, 67, 101, 110, 116, 114, 97, 108,
  3, 115, 106, 49, 1, 36, 104, 21, 66, 136, 195, 243, 194, 27, 78, 111, 114,
  116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 67, 97, 108,
  105, 102, 111, 114, 110, 105, 97, 4, 73, 78, 65, 80, 3, 115, 106, 50, 1, 75,
  25, 21, 66, 228, 212, 243, 194, 27, 78, 111, 114, 116, 104, 32, 65, 109, 101,
  114, 105, 99, 97, 44, 85, 83, 44, 67, 97, 108, 105, 102, 111, 114, 110, 105,
  97, 14, 68, 105, 103, 105, 116, 97, 108, 32, 82, 101, 97, 108, 116, 121, 3,
  115, 116, 49, 1, 228, 3, 28, 66, 13, 209, 154, 194, 25, 78, 111, 114, 116,
  104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 86, 105, 114, 103,
  105, 110, 105, 97, 8, 67, 121, 114, 117, 115, 79, 110, 101, 3, 116, 111, 49,
  1, 77, 149, 46, 66, 103, 228, 158, 194, 24, 78, 111, 114, 116, 104, 32, 65,
  109, 101, 114, 105, 99, 97, 44, 67, 65, 44, 79, 110, 116, 97, 114, 105, 111,
  7, 67, 121, 120, 116, 101, 114, 97, 3, 116, 111, 50, 1, 136, 163, 46, 66, 47,
  189, 158, 194, 24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97,
  44, 67, 65, 44, 79, 110, 116, 97, 114, 105, 111, 7, 67, 121, 120, 116, 101,
  114, 97, 3, 116, 112, 49, 1, 212, 154, 223, 65, 22, 234, 164, 194, 24, 78,
  111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 70,
  108, 111, 114, 105, 100, 97, 10, 70, 108, 101, 120, 101, 110, 116, 105, 97,
  108, 3, 116, 121, 49, 1, 110, 180, 14, 66, 122, 166, 11, 67, 13, 65, 115, 105,
  97, 44, 74, 80, 44, 84, 111, 107, 121, 111, 7, 69, 113, 117, 105, 110, 105,
  120, 3, 116, 121, 50, 1, 110, 180, 14, 66, 122, 166, 11, 67, 13, 65, 115, 105,
  97, 44, 74, 80, 44, 84, 111, 107, 121, 111, 7, 69, 113, 117, 105, 110, 105,
  120, 3, 116, 121, 51, 1, 110, 180, 14, 66, 122, 166, 11, 67, 13, 65, 115, 105,
  97, 44, 74, 80, 44, 84, 111, 107, 121, 111, 7, 69, 113, 117, 105, 110, 105,
  120, 3, 122, 104, 50, 1, 99, 127, 61, 66, 240, 167, 8, 65, 16, 69, 117, 114,
  111, 112, 101, 44, 67, 72, 44, 90, 117, 114, 105, 99, 104, 9, 69, 118, 101,
  114, 121, 119, 97, 114, 101, 3, 122, 104, 51, 1, 213, 120, 61, 66, 14, 79, 8,
  65, 16, 69, 117, 114, 111, 112, 101, 44, 67, 72, 44, 90, 117, 114, 105, 99,
  104, 7, 78, 105, 110, 101, 46, 67, 104, 3, 122, 104, 52, 1, 15, 139, 61, 66,
  210, 111, 8, 65, 16, 69, 117, 114, 111, 112, 101, 44, 67, 72, 44, 90, 117,
  114, 105, 99, 104, 7, 78, 105, 110, 101, 46, 67, 104, 3, 122, 104, 53, 1, 15,
  139, 61, 66, 210, 111, 8, 65, 16, 69, 117, 114, 111, 112, 101, 44, 67, 72, 44,
  90, 117, 114, 105, 99, 104, 8, 71, 114, 101, 101, 110, 46, 99, 104, 3, 122,
  104, 54, 1, 15, 139, 61, 66, 210, 111, 8, 65, 16, 69, 117, 114, 111, 112, 101,
  44, 67, 72, 44, 90, 117, 114, 105, 99, 104, 8, 71, 114, 101, 101, 110, 46, 99,
  104, 3, 122, 104, 55, 1, 15, 139, 61, 66, 210, 111, 8, 65, 16, 69, 117, 114,
  111, 112, 101, 44, 67, 72, 44, 90, 117, 114, 105, 99, 104, 8, 71, 114, 101,
  101, 110, 46, 99, 104, 3, 98, 97, 49, 1, 179, 140, 37, 66, 88, 202, 10, 64,
  19, 69, 117, 114, 111, 112, 101, 44, 69, 83, 44, 67, 97, 116, 97, 108, 111,
  110, 105, 97, 7, 69, 113, 117, 105, 110, 105, 120, 3, 98, 97, 50, 1, 179, 140,
  37, 66, 88, 202, 10, 64, 19, 69, 117, 114, 111, 112, 101, 44, 69, 83, 44, 67,
  97, 116, 97, 108, 111, 110, 105, 97, 7, 69, 113, 117, 105, 110, 105, 120, 3,
  98, 99, 50, 1, 124, 33, 69, 66, 204, 61, 246, 194, 33, 78, 111, 114, 116, 104,
  32, 65, 109, 101, 114, 105, 99, 97, 44, 67, 65, 44, 66, 114, 105, 116, 105,
  115, 104, 32, 67, 111, 108, 117, 109, 98, 105, 97, 7, 67, 111, 108, 111, 103,
  105, 120, 3, 98, 117, 50, 1, 11, 181, 49, 66, 236, 209, 208, 65, 19, 69, 117,
  114, 111, 112, 101, 44, 82, 79, 44, 66, 117, 99, 117, 114, 101, 115, 116, 105,
  12, 83, 116, 97, 114, 32, 83, 116, 111, 114, 97, 103, 101, 3, 99, 103, 49, 1,
  198, 45, 76, 66, 208, 36, 228, 194, 24, 78, 111, 114, 116, 104, 32, 65, 109,
  101, 114, 105, 99, 97, 44, 67, 65, 44, 65, 108, 98, 101, 114, 116, 97, 7, 69,
  113, 117, 105, 110, 105, 120, 3, 99, 105, 49, 1, 147, 105, 28, 66, 37, 6, 169,
  194, 25, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85,
  83, 44, 75, 101, 110, 116, 117, 99, 107, 121, 10, 70, 108, 101, 120, 101, 110,
  116, 105, 97, 108, 3, 99, 114, 49, 1, 141, 232, 12, 66, 171, 175, 161, 194,
  31, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83,
  44, 78, 111, 114, 116, 104, 32, 67, 97, 114, 111, 108, 105, 110, 97, 10, 70,
  108, 101, 120, 101, 110, 116, 105, 97, 108, 3, 100, 110, 49, 1, 241, 244, 30,
  66, 9, 251, 209, 194, 25, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105,
  99, 97, 44, 85, 83, 44, 67, 111, 108, 111, 114, 97, 100, 111, 10, 70, 108,
  101, 120, 101, 110, 116, 105, 97, 108, 3, 100, 117, 49, 1, 50, 102, 85, 66,
  97, 84, 200, 192, 18, 69, 117, 114, 111, 112, 101, 44, 73, 69, 44, 76, 101,
  105, 110, 115, 116, 101, 114, 7, 69, 113, 117, 105, 110, 105, 120, 3, 102,
  116, 49, 1, 173, 250, 208, 65, 76, 70, 160, 194, 24, 78, 111, 114, 116, 104,
  32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 70, 108, 111, 114, 105,
  100, 97, 10, 70, 108, 101, 120, 101, 110, 116, 105, 97, 108, 3, 108, 111, 49,
  1, 196, 2, 25, 66, 90, 132, 171, 194, 25, 78, 111, 114, 116, 104, 32, 65, 109,
  101, 114, 105, 99, 97, 44, 85, 83, 44, 75, 101, 110, 116, 117, 99, 107, 121,
  10, 70, 108, 101, 120, 101, 110, 116, 105, 97, 108, 3, 109, 100, 49, 1, 206,
  170, 33, 66, 15, 11, 109, 192, 16, 69, 117, 114, 111, 112, 101, 44, 69, 83,
  44, 77, 97, 100, 114, 105, 100, 7, 69, 113, 117, 105, 110, 105, 120, 3, 109,
  110, 49, 1, 68, 233, 51, 66, 174, 135, 186, 194, 26, 78, 111, 114, 116, 104,
  32, 65, 109, 101, 114, 105, 99, 97, 44, 85, 83, 44, 77, 105, 110, 110, 101,
  115, 111, 116, 97, 10, 70, 108, 101, 120, 101, 110, 116, 105, 97, 108, 3, 112,
  115, 49, 1, 41, 109, 67, 66, 114, 138, 22, 64, 23, 69, 117, 114, 111, 112,
  101, 44, 70, 82, 44, 73, 108, 101, 45, 100, 101, 45, 70, 114, 97, 110, 99,
  101, 7, 69, 113, 117, 105, 110, 105, 120, 3, 114, 108, 49, 1, 79, 30, 15, 66,
  194, 70, 157, 194, 31, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99,
  97, 44, 85, 83, 44, 78, 111, 114, 116, 104, 32, 67, 97, 114, 111, 108, 105,
  110, 97, 10, 70, 108, 101, 120, 101, 110, 116, 105, 97, 108, 3, 115, 103, 52,
  1, 157, 17, 173, 63, 189, 163, 207, 66, 17, 65, 115, 105, 97, 44, 83, 71, 44,
  83, 105, 110, 103, 97, 112, 111, 114, 101, 14, 68, 105, 103, 105, 116, 97,
  108, 32, 82, 101, 97, 108, 116, 121, 3, 116, 111, 51, 1, 224, 156, 46, 66, 51,
  196, 158, 194, 24, 78, 111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97,
  44, 67, 65, 44, 79, 110, 116, 97, 114, 105, 111, 7, 67, 111, 108, 111, 103,
  105, 120, 3, 116, 111, 52, 1, 224, 156, 46, 66, 51, 196, 158, 194, 24, 78,
  111, 114, 116, 104, 32, 65, 109, 101, 114, 105, 99, 97, 44, 67, 65, 44, 79,
  110, 116, 97, 114, 105, 111, 7, 69, 113, 117, 105, 110, 105, 120, 3, 116, 121,
  52, 1, 110, 180, 14, 66, 122, 166, 11, 67, 13, 65, 115, 105, 97, 44, 74, 80,
  44, 84, 111, 107, 121, 111, 7, 69, 113, 117, 105, 110, 105, 120, 0,
]);

const makeMotionDummyProposalRequest = ({ title, url, summary, neuronId }) => ({
  neuronId,
  title,
  url: url,
  summary: summary,
  action: {
    Motion: {
      motionText:
        "We think that it is too expensive to run canisters on the IC. The long term goal of the IC should be to reduce the cycles cost of all operations by a factor of 10! Please pass this motion",
    },
  },
});

const makeNetworkEconomicsDummyProposalRequest = ({
  title,
  url,
  summary,
  neuronId,
}) => ({
  neuronId,
  title,
  url,
  summary,
  action: {
    ManageNetworkEconomics: {
      neuronMinimumStake: BigInt(100_000_000),
      maxProposalsToKeepPerTopic: 1000,
      neuronManagementFeePerProposal: BigInt(10_000),
      rejectCost: BigInt(10_000_000),
      transactionFee: BigInt(1000),
      neuronSpawnDissolveDelaySeconds: BigInt(3600 * 24 * 7),
      minimumIcpXdrRate: BigInt(1),
      maximumNodeProviderRewards: BigInt(10_000_000_000),
    },
  },
});

const makeRewardNodeProviderDummyProposal = ({
  title,
  url,
  summary,
  neuronId,
}) => ({
  neuronId,
  title,
  url,
  summary,
  action: {
    RewardNodeProvider: {
      nodeProvider: {
        id: "aaaaa-aa",
        rewardAccount: undefined,
      },
      rewardMode: {
        RewardToNeuron: { dissolveDelaySeconds: BigInt(1000) },
      },
      amountE8s: BigInt(10_000_000),
    },
  },
});

const MS_IN_A_DAY = 24 * 60 * 60 * 1000;
const makeSnsDecentralizationSaleDummyProposalRequest = ({
  title,
  url,
  summary,
  neuronId,
}) => ({
  neuronId,
  title,
  url: url,
  summary: summary,
  action: {
    SetSnsTokenSwapOpenTimeWindow: {
      // TODO: update swap canister id
      swapCanisterId: "sbzkb-zqaaa-aaaaa-aaaiq-cai",
      request: {
        openTimeWindow: {
          startTimestampSeconds: BigInt(
            Math.round((Date.now() + 1000 * 60) / 1000)
          ),
          endTimestampSeconds: BigInt(
            Math.round((Date.now() + MS_IN_A_DAY + MS_IN_A_DAY * 5) / 1000)
          ),
        },
      },
    },
  },
});

const makeExecuteNnsFunctionDummyProposalRequest = ({
  title,
  url,
  summary,
  neuronId,
  nnsFunction,
  payload,
}) => ({
  neuronId,
  title,
  url,
  summary,
  action: {
    ExecuteNnsFunction: {
      // Used only in testnet and hardcoding values
      nnsFunctionId: nnsFunction,
      nnsFunctionName: undefined,
      payload: {},
      payloadBytes: payload,
    },
  },
});

const DEMO_SUMMARY = `# Pedum natura bimembres florem missos protinus

## Pariter dote tremens adiectoque facit quas effugit

__Lorem__ markdownum sacrilegi pro opus [quicquam paternis]. _Origine aestus_,
ecce nam voluntas suco.

## Visum sub at inlita terra Odrysius magnae

- https://picsum.photos/1200
- ![alt text](https://picsum.photos/1200 "The title")
- ![text](https://picsum.photos/1200)

Levis ius Rhodopen fata deo, Medea eripiat dixi recipit potuere. Simul suis
defluxere et visae _caput_ inerti. Saucius devenit, delabor fine scelerata,
curam. Fidesque hic gaudet nomine mea dubitas alitibus [vultu]. Profundi mearum
se oscula Euphorbus volentem nurus crimina, cum nuper habet, tristitiam furoris
illam viscera.

- Volitare ingenti venerat
- Non nec
- Regale Eumenidum inire longe vestibus Latreus flagrantemque

---

## Nox successibus fer ubi ardentis umbra

Tantum summam longaeque et diversorum alter anhelitus ferae; cum ubi tandem,
sed. Nunc secutus Sigeia, tamen avidae, in una duas.

## Utque inplet tale

Suis cervi habere anguipedum tinctam, mihi [dare]! Collibus dissimulare tamen
doctior modo natus inmensum inhibere aegra testantur? Armentum bellum undae
vertice Sirenum; cum semper caedis pedum. Intulit procubuit vadorum. Que ipse,
verba absens [Pygmalion] factum?

\`\`\`
if (down_path_dvd + 5 >= 32) {
    internicLanguage.boot_text_clipboard = sectorJreManet(verticalApacheClick,
            emulation);
    cluster(basicSupercomputer, optical_reader_trash(chip_vpn_codec));
} else {
    card_dvd_num(4);
    primary = igpAjax(freewareRipcording(analog, interactive_alert_standalone,
            public), gif, scareware);
    dvdFunction *= compressionComputer.stationCloud(kernelSsid, ispLte);
}
if (-4 < command_nosql_golden) {
    file.scanner -= expansionHeapError;
    metaExternal.smartphone_pebibyte_active(rosetta);
} else {
    balance_payload_domain(processHtml, 3, printAddUnit.gnuCrossplatformToken(
            5));
    python_wais_record *= scannerIllegalWhitelist(wan, address(intellectual));
    overwrite.mpeg(throughput_disk, folder_cifs_cybersquatter,
            wysiwyg_boot.system_wired(269111));
}
var push_infringement = newbie;
if (scraping_winsock(qbe.ccdOn.node(5) * raw_bank(dslam_hoc, 2, 1), -4)) {
    text_mac_hyper.inboxLayout.adHoneypot(unc, dvd_dongle + 35);
    nativeCifs(table_stack_toggle + frame_recycle);
    login.rss_hsf_snmp -= 2;
}
if (icq >= dv_gigo - rubySolidLog) {
    drive -= cgi_samba_mebibyte;
}
\`\`\`

## Solet artus orbam parentis auraeque Priamum

__Semper locorum__, quamvis qui census minuunt vernat; cupit colonis suo quoque
arcum illum totidem. Grata erat perierunt aerias notavit presso, puellas
[intravit]. Gravi capillis. Flore _utque animam_ vota minimum mentis, ingens
eripuisse, albis mihi auctore.

[Acuta condi fessos] ille! Inde erit sic terraeque leti ruricolasque fisso pro
adstas patrios, nescio quam coepit!

[Acuta condi fessos]: http://ingentia.com/deriguere.aspx
[Pygmalion]: http://tibi.net/retro
[dare]: http://tacta.io/cognosse-cnosiaco
[ignis Iovis sacrilegos]: http://dissimulant.net/
[intravit]: http://tamen-tumulus.org/
[pecoris redeunt]: http://www.ego-ingens.io/
[quicquam paternis]: http://visasit.com/dumque
[vultu]: http://lentas-petitur.com/`;

export const makeDummyProposals = async ({ neuronId, canister }) => {
  try {
    // Used only on testnet
    // We do one by one, in case one fails, we don't do the others.
    const request0 = makeSnsDecentralizationSaleDummyProposalRequest({
      title: "Test sns proposal title",
      neuronId,
      url: "https://www.google.com/search?q=The+world%E2%80%99s+fastest+general-purpose+blockchain+to+build+the+future+of+Web3",
      summary: DEMO_SUMMARY,
    });
    console.log("SnsDecentralizationSale Proposal...");
    await canister.makeProposal(request0);

    const request1 = makeMotionDummyProposalRequest({
      title:
        "Test proposal title - Lower all prices! (update subnet trq4oi-xbazd-zui8u-o55wc-ehun7-932tw-8qpqs-nittd-nbpq6-4aabt-1ur to replica version gffdb82z637e374yd3b8f48a831cbed889d35397)",
      neuronId,
      url: "https://www.google.com/search?q=The+world%E2%80%99s+fastest+general-purpose+blockchain+to+build+the+future+of+Web3",
      summary: DEMO_SUMMARY,
    });
    console.log("Motion Proposal...");
    await canister.makeProposal(request1);
    const request2 = makeNetworkEconomicsDummyProposalRequest({
      neuronId,
      title: "Increase minimum neuron stake",
      url: "https://www.lipsum.com/",
      summary: "Increase minimum neuron stake",
    });
    console.log("Netowrk Economics Proposal...");
    await canister.makeProposal(request2);
    const request3 = makeRewardNodeProviderDummyProposal({
      neuronId,
      url: "https://www.lipsum.com/",
      title: "Reward for Node Provider 'ABC'",
      summary: "Reward for Node Provider 'ABC'",
    });
    console.log("Rewards Node Provide Proposal...");
    await canister.makeProposal(request3);
    const request4 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title: "Add node(s) to subnet 10",
      url: "https://github.com/ic-association/nns-proposals/blob/main/proposals/subnet_management/20210928T1140Z.md",
      summary: "Add node(s) to subnet 10",
      nnsFunction: 2,
      payload: addNodeToSubnetPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request4);
    const request5 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title: "Update configuration of subnet: tdb26-",
      url: "",
      summary:
        "Update the NNS subnet tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe in order to grant backup access to three backup pods operated by the DFINITY Foundation. The backup user has only read-only access to the recent blockchain artifacts.",
      nnsFunction: 7,
      payload: updateSubnetConfigPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request5);
    const request6 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title:
        "Update subnet shefu-t3kr5-t5q3w-mqmdq-jabyv-vyvtf-cyyey-3kmo4-toyln-emubw-4qe to version 3eaf8541c389badbd6cd50fff31e158505f4487d",
      url: "https://github.com/ic-association/nns-proposals/blob/main/proposals/subnet_management/20210930T0728Z.md",
      summary:
        "Update subnet shefu-t3kr5-t5q3w-mqmdq-jabyv-vyvtf-cyyey-3kmo4-toyln-emubw-4qe to version 3eaf8541c389badbd6cd50fff31e158505f4487d",
      nnsFunction: 11,
      payload: updateSubnetPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request6);
    const request7 = makeExecuteNnsFunctionDummyProposalRequest({
      neuronId,
      title: "Initialize datacenter records",
      url: "",
      summary:
        "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553",
      nnsFunction: 21,
      payload: addOrRemoveDataCentersPayload,
    });
    console.log("Execute NNS Function Proposal...");
    await canister.makeProposal(request7);
    console.log("Finished making dummy proposals");
  } catch (e) {
    console.log(e);
    throw e;
  }
};
