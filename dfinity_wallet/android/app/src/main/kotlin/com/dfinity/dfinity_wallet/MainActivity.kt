package com.dfinity.dfinity_wallet

import android.annotation.SuppressLint
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import android.util.Base64
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Signature
import java.security.spec.ECGenParameterSpec

class MainActivity: FlutterActivity() {
    private val CHANNEL = "internet_computer.signing"
    val handler = KeyEnclaveHandler()

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            handler.onMethodCall(call, result)
        }
    }
}


class KeyEnclaveHandler {

    fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        if (call.method == "generateKey") {
            val walletId = call.argument<String>("walletId")!!
            val tag = "com.internetcomputer.${walletId}"
            try {
                val public = this.generateKey(tag)
                result.success(mapOf(
                        "publicKey" to public
                ))
            }
            catch (e:java.lang.Exception) {
                result.success(mapOf(
                        "error" to mapOf(
                                "type" to "privateKeyGeneration",
                                "description" to e.localizedMessage
                        )
                ))
                return
            }
        } else if(call.method == "sign"){
            val tag = call.argument<String>("walletId")!!
            val message = call.argument<String>("MESSAGE")!!
            try {
                var signature = this.signData(tag, message)
                result.success(signature)
            } catch(e :java.lang.Exception) {
                result.error("400", "sign failed "+e.message, null)
            }

        } else if (call.method == "deleteKey") {
            val tag = call.argument<String>("walletId")!!
            try {
                this.deleteKey(tag)
                result.success("success")
            } catch(e :java.lang.Exception) {
                result.error("400", "sign failed "+e.message, null)
            }

        } else {
            result.notImplemented();
        }
    }

    val ANDROID_KEYSTORE = "AndroidKeyStore"
    private fun signData(tag: String,message: String): String? {
        try {
            //We get the Keystore instance
            val keyStore: KeyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply {
                load(null)
            }

            val privateKey: PrivateKey = keyStore.getKey(tag, null) as PrivateKey

            val signature: ByteArray? = Signature.getInstance("SHA512withECDSA").run {
                initSign(privateKey)
                update(message.toByteArray())
                sign()
            }

            if (signature != null) {
                return Base64.encodeToString(signature, Base64.DEFAULT);
            } else {
                throw Error("invalid signature")
            }

        } catch (e: KeyPermanentlyInvalidatedException) {
            throw e
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    private fun deleteKey(tag: String) {
        val keyStore: KeyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply {
            load(null)
        }
        keyStore.deleteEntry(tag)
    }

    private fun generateKey(tag: String): String? {
        val keyPairGenerator: KeyPairGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, ANDROID_KEYSTORE)
        val parameterSpec: KeyGenParameterSpec =   KeyGenParameterSpec.Builder(tag,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY).
        setDigests(KeyProperties.DIGEST_SHA512).
        setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1")).
        build()
        keyPairGenerator.initialize(parameterSpec)
        return Base64.encodeToString(keyPairGenerator.genKeyPair().public.encoded,Base64.DEFAULT)
    }

}