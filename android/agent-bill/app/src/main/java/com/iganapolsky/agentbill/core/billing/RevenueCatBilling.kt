package com.iganapolsky.agentbill.core.billing

import android.app.Activity
import android.util.Log
import com.iganapolsky.agentbill.data.KeyStore
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesError
import com.revenuecat.purchases.getCustomerInfoWith
import com.revenuecat.purchases.getProductsWith
import com.revenuecat.purchases.models.StoreProduct
import com.revenuecat.purchases.models.StoreTransaction
import com.revenuecat.purchases.purchaseWith
import com.revenuecat.purchases.PurchaseParams
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlinx.coroutines.suspendCancellableCoroutine

/**
 * Real Google Play billing via RevenueCat. Replaces the old local-only stubs that granted
 * entitlements for free (the reason the app collected $0). Every purchase now goes through Play's
 * billing flow and only grants access on a confirmed, RevenueCat-verified transaction.
 *
 * Configuration the owner must complete for this to charge money:
 *  1. Set the real RevenueCat public SDK key in TelemetryService (currently a placeholder).
 *  2. Create these products in Google Play Console AND import them into RevenueCat:
 *     - [SKU_PRO]    : auto-renewing subscription, attached to entitlement [ENTITLEMENT_PRO]
 *     - [SKU_INTRO]  : one-time (consumable) product
 *     - [SKU_SINGLE] : one-time (consumable) product
 */
@Singleton
class RevenueCatBilling @Inject constructor(
    private val keyStore: KeyStore,
) {
    sealed interface PurchaseOutcome {
        data object Success : PurchaseOutcome
        data object Cancelled : PurchaseOutcome
        data class Failed(val message: String) : PurchaseOutcome
    }

    /**
     * Launch the Play billing flow for [productId] and, only on a verified purchase, grant the
     * corresponding entitlement locally (subscription -> subscribed; consumables -> credits).
     */
    suspend fun purchase(activity: Activity, productId: String): PurchaseOutcome {
        val product = fetchProduct(productId)
            ?: return PurchaseOutcome.Failed("Product \"$productId\" is not available. Check Play Console / RevenueCat setup.")

        return suspendCancellableCoroutine { cont ->
            Purchases.sharedInstance.purchaseWith(
                PurchaseParams.Builder(activity, product).build(),
                onError = { error: PurchasesError, userCancelled: Boolean ->
                    if (cont.isActive) {
                        cont.resume(
                            if (userCancelled) PurchaseOutcome.Cancelled
                            else PurchaseOutcome.Failed(error.message),
                        )
                    }
                },
                onSuccess = { _: StoreTransaction?, customerInfo: CustomerInfo ->
                    grantEntitlement(productId, customerInfo)
                    if (cont.isActive) cont.resume(PurchaseOutcome.Success)
                },
            )
        }
    }

    /** Re-syncs subscription state from RevenueCat so a paid user stays unlocked across reinstalls. */
    fun syncEntitlements() {
        Purchases.sharedInstance.getCustomerInfoWith(
            onError = { Log.w(TAG, "Could not refresh entitlements: ${it.message}") },
            onSuccess = { info -> keyStore.setSubscribed(info.isProActive()) },
        )
    }

    private fun grantEntitlement(productId: String, customerInfo: CustomerInfo) {
        when (productId) {
            SKU_PRO -> keyStore.setSubscribed(customerInfo.isProActive())
            SKU_INTRO -> keyStore.addAuditCredits(INTRO_CREDITS)
            SKU_SINGLE -> keyStore.addAuditCredits(1)
            else -> Log.w(TAG, "Purchased unknown product $productId; no entitlement granted")
        }
    }

    private suspend fun fetchProduct(productId: String): StoreProduct? =
        suspendCancellableCoroutine { cont ->
            Purchases.sharedInstance.getProductsWith(
                listOf(productId),
                onError = { error ->
                    Log.e(TAG, "getProducts failed: ${error.message}")
                    if (cont.isActive) cont.resume(null)
                },
                onGetStoreProducts = { products ->
                    if (cont.isActive) cont.resume(products.firstOrNull { it.id == productId } ?: products.firstOrNull())
                },
            )
        }

    private fun CustomerInfo.isProActive(): Boolean =
        entitlements[ENTITLEMENT_PRO]?.isActive == true

    companion object {
        private const val TAG = "RevenueCatBilling"
        const val ENTITLEMENT_PRO = "pro"
        const val SKU_PRO = "agentbill_pro_monthly"
        const val SKU_INTRO = "agentbill_intro_7day"
        const val SKU_SINGLE = "agentbill_single_audit"
        const val INTRO_CREDITS = 10
    }
}
