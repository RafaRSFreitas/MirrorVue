import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useIAP, ErrorCode } from 'expo-iap';

// These are the four fixed Google Play product IDs defined for MirrorVue.
// Prices are intentionally not stored here because Google Play provides localized prices at runtime.
const DONATION_PRODUCT_IDS = [
  'donation_1',
  'donation_2',
  'donation_3',
  'donation_4',
];

export default function DonationPanel({ onClose }) {
  // Track which donation option is currently being purchased.
  const [purchasingProductId, setPurchasingProductId] = useState(null);

  // Display a simple status message for loading, unavailable, pending, or billing errors.
  const [statusMessage, setStatusMessage] = useState('');

  // useIAP manages the Google Play connection and purchase listeners for this component.
  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    // Handle a successfully completed purchase.
    onPurchaseSuccess: async (purchase) => {
      // A purchase may report a pending state while Google Play is still processing payment.
      if (purchase.purchaseState === 'pending') {
        setPurchasingProductId(null);
        setStatusMessage('Your donation is still being processed by Google Play.');
        return;
      }

      try {
        // Finish the transaction as consumable so the same donation product can be purchased again.
        await finishTransaction({
          purchase,
          isConsumable: true,
        });

        setPurchasingProductId(null);
        setStatusMessage('Thank you for supporting MirrorVue!');
      } catch (error) {
        // Keep the donation panel usable even if transaction finalization fails.
        setPurchasingProductId(null);
        setStatusMessage('The purchase was completed, but it could not be finalized yet.');
      }
    },

    // Handle cancellation and other Google Play billing errors.
    onPurchaseError: (error) => {
      setPurchasingProductId(null);

      // Closing the Google Play purchase window is not a real error from the user's perspective.
      if (error.code === ErrorCode.UserCancelled) {
        setStatusMessage('');
        return;
      }

      // Show the billing error without blocking access to the mirror.
      setStatusMessage(error.message || 'The donation could not be completed.');
    },
  });

  // Load the four donation products once Google Play Billing is connected.
  useEffect(() => {
    if (!connected) {
      return;
    }

    setStatusMessage('');

    fetchProducts({
      skus: DONATION_PRODUCT_IDS,
      type: 'in-app',
    }).catch((error) => {
      // Explain that the donation service is unavailable while leaving the core mirror unaffected.
      setStatusMessage('Donations are temporarily unavailable. Please try again later.');
    });
  }, [connected, fetchProducts]);

  // Find the product currently being purchased so its button can show a loading state.
  const isPurchasing = (productId) => purchasingProductId === productId;

  // Start the Google Play purchase flow for the selected donation product.
  const handlePurchase = async (productId) => {
    if (!connected || purchasingProductId) {
      return;
    }

    setPurchasingProductId(productId);
    setStatusMessage('');

    try {
      // The product is an in-app consumable, so Google Play opens its normal purchase UI.
      await requestPurchase({
        request: {
          google: {
            skus: [productId],
          },
        },
        type: 'in-app',
      });
    } catch (error) {
      // requestPurchase can fail before the purchase callback is reached.
      setPurchasingProductId(null);
      setStatusMessage(error.message || 'Unable to start the donation.');
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
        onTouchEnd={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <View
          style={styles.panel}
        >
        {/* Display the fixed donation heading. */}
        <View style={styles.header}>
          <Text style={styles.title}>Buy me a coffee</Text>
        </View>

        {/* Close the DonationPanel and return to the mirror preview. */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
            activeOpacity={0.7}>
          <Text style={styles.closeText}> ✕ </Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
        <Text style={styles.description}>
          MirrorVue is free, with no ads, and fully functional for everyone!          
        </Text>
        <Text style={styles.description}>   
          If you find the app useful, you can support the development through a voluntary donation.
        </Text>        

        {/* Show a loading message while the Google Play connection is being established. */}
        {!connected && !statusMessage && (
          <View style={styles.statusContainer}>
            <ActivityIndicator />
            <Text style={styles.statusText}>Connecting to Google Play...</Text>
          </View>
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
        {connected && products.length === 0 && !statusMessage && (
          <Text style={styles.statusText}>
            Donations are temporarily unavailable.
          </Text>
        )}

        {/* Display billing, cancellation, connectivity, and purchase-status information. */}
          {!!statusMessage && (
            <Text style={styles.statusText}>{statusMessage}</Text>
          )}
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Cover the mirror with a semi-transparent layer while the DonationPanel is open.
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Receive dismissal taps only when the touch target is the overlay itself.
  // (The panel is a sibling above it, so card touches never reach it.)

  // Keep the donation choices inside a compact readable panel.
  panel: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(0,0,0,0.88)',
    borderRadius: 12,
    padding: 24,
    maxHeight: '90%',
    flexShrink: 1,
    zIndex: 1,
    elevation: 1,
  },

  // Keep the card title above the scrollable content.
  header: {
    marginBottom: 8,
    paddingRight: 48,
  },

  // Let donation content shrink to the available height and scroll when needed.
  scrollView: {
    flexShrink: 1,
  },

  // Keep the content clear of the fixed header and the panel edge.
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Place the close button in the upper-right corner of the panel.
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    elevation: 30,
  },

  // Use a simple close symbol rather than adding another icon dependency.
  closeText: {
    color: 'white',
    fontSize: 20,
  },

  // Make the donation heading clearly visible.
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },

  // Explain the purpose of the panel without adding unnecessary instructions.
  description: {
    color: 'white',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },

  // Display the localized Google Play product name prominently.
  productTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Display the localized Google Play price without hard-coding any currency.
  productPrice: {
    color: 'white',
    fontSize: 15,
    marginTop: 4,
  },

  // Center loading information while Google Play is connecting.
  statusContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },

  // Display billing status information clearly without blocking the rest of the app.
  statusText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 14,
  },
});