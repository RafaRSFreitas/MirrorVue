import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  useIAP,
  ErrorCode,
  getAvailablePurchases as getStorePurchases,
} from "expo-iap";
import ModalShell from "./ModalShell";
import { useSettings } from "../SettingsContext";

// These are the four fixed Google Play product IDs defined for MirrorVue.
// Prices are intentionally not stored here because Google Play provides localized prices at runtime.
const DONATION_PRODUCT_IDS = [
  "donation_1",
  "donation_2",
  "donation_3",
  "donation_4",
];

// Google Play can report the same billing error when starting a purchase or later in its callback.
function purchaseStatus(error, fallback) {
  switch (error?.code) {
    case ErrorCode.UserCancelled:
      return "";
    case ErrorCode.Pending:
    case ErrorCode.DeferredPayment:
      return "pending";
    case ErrorCode.NetworkError:
      return "networkError";
    case ErrorCode.BillingUnavailable:
    case ErrorCode.ItemUnavailable:
    case ErrorCode.ServiceDisconnected:
      return "unavailable";
    default:
      return fallback;
  }
}

export default function DonationPanel({ visible = true, onClose }) {
  const { strings } = useSettings();

  // Track which donation option is currently being purchased.
  const [purchasingProductId, setPurchasingProductId] = useState(null);

  // Keep the message key so the panel always uses the current language.
  const [status, setStatus] = useState("");

  // useIAP manages the Google Play connection and purchase listeners for this component.
  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    reconnect,
  } = useIAP({
    // Report a failure of the Google Play connection, so the panel can explain that
    // donations are temporarily unavailable instead of waiting forever.
    onError: () => {
      setStatus("unavailable");
    },
    // Handle a successfully completed purchase.
    onPurchaseSuccess: async (purchase) => {
      // A purchase may report a pending state while Google Play is still processing payment.
      if (purchase.purchaseState === "pending") {
        setPurchasingProductId(null);
        setStatus("pending");
        return;
      }

      // Only a confirmed purchase may be finalized and thanked.
      if (purchase.purchaseState !== "purchased") {
        setPurchasingProductId(null);
        setStatus("unconfirmed");
        return;
      }

      try {
        // Finish the transaction as consumable so the same donation product can be purchased again.
        await finishTransaction({
          purchase,
          isConsumable: true,
        });

        setPurchasingProductId(null);
        setStatus("thanks");
      } catch (error) {
        // Keep the donation panel usable even if transaction finalization fails.
        setPurchasingProductId(null);
        setStatus("unfinished");
      }
    },

    // Handle cancellation and other Google Play billing errors.
    onPurchaseError: (error) => {
      setPurchasingProductId(null);

      setStatus(purchaseStatus(error, "failed"));
    },
  });

  // Load the four donation products once Google Play Billing is connected.
  useEffect(() => {
    if (!connected) {
      return;
    }

    setStatus("");

    fetchProducts({
      skus: DONATION_PRODUCT_IDS,
      type: "in-app",
    }).catch((error) => {
      // Explain that the donation service is unavailable while leaving the core mirror unaffected.
      setStatus("unavailable");
    });

    // Finish any purchase that was not consumed before, for example when the app was
    // closed right after the payment. Without this, the same donation could not be
    // bought a second time, because Google Play still considers it owned.
    getStorePurchases()
      .then(async (purchases) => {
        for (const purchase of purchases) {
          if (!DONATION_PRODUCT_IDS.includes(purchase.productId)) {
            continue;
          }
          // Pending purchases must be left untouched until Google Play completes them.
          if (purchase.purchaseState !== "purchased") {
            continue;
          }
          try {
            await finishTransaction({ purchase, isConsumable: true });
          } catch (error) {
            // Keep processing the remaining purchases when one cannot be finalized.
            console.warn(
              "Mirror Vue donation recovery error:",
              error?.message ?? error,
            );
          }
        }
      })
      .catch((error) => {
        // A purchase that cannot be read is not fatal for the panel.
        console.warn(
          "Mirror Vue donation recovery error:",
          error?.message ?? error,
        );
      });
  }, [connected, fetchProducts, finishTransaction]);

  // Find the product currently being purchased so its button can show a loading state.
  const isPurchasing = (productId) => purchasingProductId === productId;

  // Start the Google Play purchase flow for the selected donation product.
  const handlePurchase = async (productId) => {
    if (!connected || purchasingProductId) {
      return;
    }

    setPurchasingProductId(productId);
    setStatus("");

    try {
      // The product is an in-app consumable, so Google Play opens its normal purchase UI.
      await requestPurchase({
        request: {
          google: {
            skus: [productId],
          },
        },
        type: "in-app",
      });
    } catch (error) {
      // requestPurchase can fail before the purchase callback is reached.
      setPurchasingProductId(null);
      setStatus(purchaseStatus(error, "startFailed"));
    }
  };

  // Try to reach Google Play again, after a failed attempt.
  const handleRetryConnection = async () => {
    setStatus("");

    const didConnect = await reconnect();

    if (!didConnect) {
      setStatus("unavailable");
    }
  };

  // Menu only mounts this panel while it is open, so it defaults to visible
  // and renders nothing only when explicitly closed through the visible prop.
  if (!visible) return null;

  return (
    <ModalShell
      visible
      title={strings.menu.donate}
      onClose={onClose}
      panelStyle={styles.panel}
      closeTextSize={20}
    >
      <Text style={styles.description}>
        {strings.donation.intro}
      </Text>
      <Text style={styles.description}>
        {strings.donation.support}
      </Text>

      {/* Show a loading message while the Google Play connection is being established. */}
      {!connected && !status && (
        <View style={styles.statusContainer}>
          <ActivityIndicator />
          <Text style={styles.statusText}>{strings.donation.connecting}</Text>
        </View>
      )}

      {/* Let the user try again when Google Play could not be reached. */}
      {!connected && !!status && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetryConnection}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>{strings.donation.retry}</Text>
        </TouchableOpacity>
      )}

      {/* Display each product exactly as returned by Google Play. */}
      <View style={styles.productsContainer}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productButton}
            onPress={() => handlePurchase(product.id)}
            disabled={!connected || !!purchasingProductId}
          >
            {isPurchasing(product.id) ? (
              <ActivityIndicator />
            ) : (
              <>
                {/* Product names come from Google Play rather than being hard-coded. */}
                <Text style={styles.productTitle}>{product.title}</Text>

                {/* displayPrice is supplied by Google Play in the user's localized currency. */}
                <Text style={styles.productPrice}>{product.displayPrice}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Explain that no donation is available if Google Play did not return the products. */}
      {connected && products.length === 0 && !status && (
        <Text style={styles.statusText}>
          {strings.donation.empty}
        </Text>
      )}

      {/* Display billing, cancellation, connectivity, and purchase-status information. */}
      {!!status && (
        <Text style={styles.statusText}>{strings.donation[status]}</Text>
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  // Keep the donation choices inside a compact readable panel.
  panel: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 12,
  },

  // Explain the purpose of the panel without adding unnecessary instructions.
  description: {
    color: "white",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },

  // Keep the four donation choices visually separated.
  productsContainer: {
    gap: 10,
  },

  // Give every donation option a large, accessible touch target.
  productButton: {
    minHeight: 60,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  // Display the localized Google Play product name prominently.
  productTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Display the localized Google Play price without hard-coding any currency.
  productPrice: {
    color: "white",
    fontSize: 15,
    marginTop: 4,
  },

  // Center loading information while Google Play is connecting.
  statusContainer: {
    alignItems: "center",
    marginVertical: 12,
  },

  // Display billing status information clearly without blocking the rest of the app.
  statusText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 14,
  },

  // Give the retry button a large, accessible touch target.
  retryButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  // Display the retry label clearly.
  retryText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
});
