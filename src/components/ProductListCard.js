import { View, Text, TouchableOpacity, Image, Alert } from "react-native"
import { memo, useCallback, useEffect } from "react"
import Ionicons from "react-native-vector-icons/Ionicons"
import useCartStore from "../stores/cartStore"
import useWishlistStore from "../stores/wishlistStore"
import useAuthStore from "../stores/authStore"
import { colors } from "../theme"
import StarRating from "./ui/StarRating"
import DiscountBadge from "./ui/DiscountBadge"

const ProductListCard = ({ productListing, onPress, className = "" }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  // Use Zustand selectors for optimal performance
  const cartItemQuantity = useCartStore((state) => state.getCartItemQuantity(productListing.id))
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const initializeCart = useCartStore((state) => state.initializeCart)
  
  // Initialize cart on mount
  useEffect(() => {
    initializeCart(user?.id)
  }, [user?.id, initializeCart])
  
  // Use selector to properly subscribe to wishlist state changes
  const isProductInWishlist = useWishlistStore((state) => 
    state.wishlistItemIds.has(productListing.id)
  )
  const wishlistLoading = useWishlistStore((state) => state.isLoading)
  
  const handleAddToCart = useCallback(() => {
    addToCart(productListing, 1, user?.id)
  }, [addToCart, productListing, user?.id])

  const handleIncreaseQuantity = useCallback(() => {
    addToCart(productListing, 1, user?.id)
  }, [addToCart, productListing, user?.id])

  const handleDecreaseQuantity = useCallback(() => {
    if (cartItemQuantity > 1) {
      updateQuantity(productListing.id, cartItemQuantity - 1, user?.id)
    } else {
      removeFromCart(productListing.id, user?.id)
    }
  }, [cartItemQuantity, updateQuantity, removeFromCart, productListing.id, user?.id])

  const handleWishlistToggle = useCallback(async (e) => {
    e.stopPropagation(); // Prevent triggering onPress of the card
    
    if (!isAuthenticated || !user) {
      Alert.alert("Login Required", "Please login to add items to wishlist");
      return;
    }
    
    // Prevent multiple clicks while loading
    if (wishlistLoading) {
      return;
    }

    // Note: We intentionally allow out-of-stock products to be added to wishlist
    // Stock status should not prevent wishlist operations
    
    try {
      // Get store methods directly
      const store = useWishlistStore.getState();
      
      // Ensure wishlist is initialized
      const initResult = await store.ensureWishlistInitialized(user.id);
      if (!initResult.success) {
        Alert.alert("Error", "Failed to initialize wishlist. Please try again.");
        return;
      }
      
      // Get current state and toggle (works regardless of stock status)
      const wasInWishlist = store.isInWishlist(productListing.id);
      const result = await store.toggleWishlist(productListing);
      
      if (!result.success && result.error && !result.error.includes('already in wishlist')) {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert("Error", "Failed to update wishlist");
    }
  }, [isAuthenticated, user, wishlistLoading, productListing])

  const inStock = productListing.stock > 0
  
  // Debug log to verify component is updated
  console.log('ProductListCard rendered with new layout');

  return (
    <TouchableOpacity 
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.gray[100]
      }}
      onPress={onPress} 
      activeOpacity={0.9}
    >
      {/* NEW LARGER IMAGE SECTION */}
      <View style={{
        position: 'relative',
        marginRight: 12,
        width: 96,  // Larger than before (was ~80)
        height: 96  // Square aspect ratio
      }}>
        <View style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors.gray[50],
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <Image
            source={{
              uri: productListing.main_image || productListing.thumbnail || "/placeholder.svg?height=200&width=200",
            }}
            style={{
              width: '100%',
              height: '100%',
              padding: 6
            }}
            resizeMode="contain"
          />
          
          {!inStock && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5
            }}>
              <Text style={{
                color: colors.text.white,
                fontSize: 12,
                fontWeight: '600',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4
              }}>Out of Stock</Text>
            </View>
          )}
        </View>
        
        {/* Discount Badge */}
        <DiscountBadge 
          mrp={productListing.mrp} 
          price={productListing.price} 
          style={{ position: 'absolute', top: -6, left: -6 }} 
        />
      </View>

      {/* IMPROVED CONTENT SECTION */}
      <View style={{
        flex: 1,
        justifyContent: 'space-between'
      }}>
        {/* TOP INFO */}
        <View>
          {/* Brand */}
          {productListing.brand && (
            <Text style={{
              color: colors.text.secondary,
              fontSize: 11,
              fontWeight: '600',
              textTransform: 'uppercase',
              marginBottom: 2
            }} numberOfLines={1}>
              {productListing.brand.name}
            </Text>
          )}

          {/* Product Name */}
          <Text style={{
            color: colors.text.primary,
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 16,
            marginBottom: 2
          }} numberOfLines={2}>
            {productListing.name}
          </Text>

          {/* Variant */}
          {productListing.variant_name && (
            <Text style={{
              color: colors.text.muted,
              fontSize: 12,
              marginBottom: 6
            }} numberOfLines={1}>
              {productListing.variant_name}
            </Text>
          )}

          {/* Rating */}
          {productListing.rating > 0 && (
            <View style={{ marginBottom: 6 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 2
              }}>
                <StarRating rating={productListing.rating} size={10} />
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: 11,
                  marginLeft: 4
                }}>({productListing.rating})</Text>
              </View>
              {productListing.review_count > 0 && (
                <Text style={{
                  color: colors.text.light,
                  fontSize: 11
                }}>{productListing.review_count} reviews</Text>
              )}
            </View>
          )}
        </View>

        {/* BOTTOM ACTIONS */}
        <View style={{ justifyContent: 'flex-end' }}>
          {/* Price & Wishlist Row */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1
            }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: 16,
                fontWeight: 'bold',
                marginRight: 8
              }}>₹{productListing.price}</Text>
              {productListing.mrp && productListing.mrp > productListing.price && (
                <Text style={{
                  color: colors.text.light,
                  fontSize: 12,
                  textDecorationLine: 'line-through'
                }}>₹{productListing.mrp}</Text>
              )}
            </View>
            
            {/* FIXED WISHLIST BUTTON */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: isProductInWishlist ? colors.error : colors.gray[300],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}
              onPress={handleWishlistToggle}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isProductInWishlist ? "heart" : "heart-outline"}
                size={16}
                color={isProductInWishlist ? colors.error : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Stock & Add to Cart Row */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Text style={{
              color: inStock ? colors.success : colors.error,
              fontSize: 11,
              fontWeight: '600'
            }}>
              {inStock ? `${productListing.stock} in stock` : "Out of stock"}
            </Text>
            
            {/* Compact Add to Cart */}
            {cartItemQuantity > 0 ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={handleDecreaseQuantity}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={cartItemQuantity === 1 ? "trash-outline" : "remove"} 
                    size={12} 
                    color={colors.text.white} 
                  />
                </TouchableOpacity>
                
                <View style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  marginHorizontal: 6,
                  borderWidth: 1,
                  borderRadius: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>{cartItemQuantity}</Text>
                </View>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={handleIncreaseQuantity}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={12} color={colors.text.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  backgroundColor: inStock ? colors.surface : colors.gray[200],
                  borderColor: inStock ? colors.primary : colors.gray[300]
                }}
                onPress={handleAddToCart}
                disabled={!inStock}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: inStock ? colors.primary : colors.text.light,
                  fontSize: 12,
                  fontWeight: '700'
                }}>
                  {!inStock ? "Out of Stock" : "ADD"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default memo(ProductListCard)
