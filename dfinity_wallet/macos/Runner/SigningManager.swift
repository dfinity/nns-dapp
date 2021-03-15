//
//  KeyGenerator.swift
//  Runner
//
//  Created by Gilbert Jolly on 15/03/2021.
//

import Foundation
import FlutterMacOS
import Security

enum KeyGenerationError: Error {
    case privateKeyGeneration(String)
    case publicKeyFetching(String)
}

class SigningManager {
    
    func handleCall(call: FlutterMethodCall, result: @escaping FlutterResult) {
        let args = call.arguments as! Dictionary<String, Any>
        
        if(call.method == "generateKey"){
            let walletId = args["walletId"] as! String
            do {
    
                let key = try generateKey(walletId: walletId)
                result(["publicKey": key])
            } catch KeyGenerationError.privateKeyGeneration(let reason) {
                result(["error": [
                    "type": "privateKeyGeneration",
                    "description" : reason
                ]])
                
            } catch KeyGenerationError.publicKeyFetching(let reason) {
                result(["error": [
                    "type": "publicKeyFetching",
                    "description" : reason
                ]])
            }catch {
                result(["error": [
                    "type": "unkown",
                    "description" : "Unknown Error"
                ]])
            }
        }
    }
    
    func generateKey(walletId: String) throws -> String {
        let tag = "com.internetcomputer.\(walletId)".data(using: .utf8)!
        
        let attributes: [String: Any] =
            [kSecAttrKeyType as String: kSecAttrKeyTypeEC,
             kSecAttrKeySizeInBits as String: 256,
             kSecPrivateKeyAttrs as String: [kSecAttrIsPermanent as String:true,
                                            kSecAttrApplicationTag as String: tag]
        ]
 
        var error: Unmanaged<CFError>?
        guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
            throw KeyGenerationError.privateKeyGeneration((error!.takeRetainedValue() as Error).localizedDescription)
        }
        
        let publicKey = SecKeyCopyPublicKey(privateKey)
        
        var pkKeyError:Unmanaged<CFError>?
        guard let cfdata = SecKeyCopyExternalRepresentation(publicKey!, &pkKeyError) else {
            throw KeyGenerationError.publicKeyFetching((error!.takeRetainedValue() as Error).localizedDescription)
        }
        let data:Data = cfdata as Data
        let b64Key = data.base64EncodedString()
        return b64Key
    }
}
