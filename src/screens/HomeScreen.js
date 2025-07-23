import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import { heroProducts } from "../data/sampleData";
import { products, categories, brands, bestSellingProducts, testimonials } from "../data/sampleData"
import { colors, spacing, typography } from "../theme"
import React, { useState } from "react";

const { width } = Dimensions.get("window")

const HomeScreen = () => {
  const navigation = useNavigation();
  const [visibleProductCount, setVisibleProductCount] = useState(2);

  const handleLoadMoreProducts = () => {
    if (visibleProductCount < products.length) {
      setVisibleProductCount((prev) => Math.min(prev + 2, products.length));
    }
  };

  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      <FlatList
        data={heroProducts}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.heroCard}>
            {/* Deal Badge */}
            {item.dealBadge && (
              <View style={styles.dealBadge}>
                <Text style={styles.dealBadgeText}>{item.dealBadge}</Text>
              </View>
            )}
            {/* Discount Badge */}
            {item.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}</Text>
              </View>
            )}
            {/* Product Image */}
            <View style={styles.heroImageContainer}>
              <Image source={{ uri: item.image }} style={styles.heroImage} />
            </View>
            {/* Product Info */}
            <View style={styles.heroInfo}>
              <Text style={styles.heroProductName}>{item.name}</Text>
              {/* Rating */}
              <View style={styles.heroRating}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"}
                      size={16}
                      color={colors.warning}
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>({item.rating})</Text>
                <Text style={styles.reviewsText}>{item.reviews} reviews</Text>
              </View>
              {/* Price */}
              <View style={styles.heroPriceContainer}>
                <Text style={styles.heroPrice}>₹{item.price}</Text>
                <Text style={styles.heroOriginalPrice}>₹{item.originalPrice}</Text>
              </View>
              {/* Stock Status */}
              {item.inStock && <Text style={styles.stockStatus}>✓ In Stock</Text>}
              {/* Get This Deal Button */}
              <TouchableOpacity
                style={styles.dealButton}
                onPress={() => navigation.navigate("ProductDetail", { product: item })}
              >
                <Ionicons name="bag-add" size={20} color={colors.background} />
                <Text style={styles.dealButtonText}>Get This Deal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingRight: 0 }}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={width - spacing.md * 2}
        getItemLayout={(_, index) => ({ length: width - spacing.md * 2, offset: (width - spacing.md * 2) * index, index })}
      />
    </View>
  )

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop from Top Categories</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderProductsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Grab the best deal on Our Products</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
            style={styles.horizontalProductCard}
          />
        )}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  )

  const renderBrands = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop from Top Brands</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brandsContainer}>
        {brands.map((brand) => (
          <TouchableOpacity key={brand.id} style={styles.brandItem}>
            <View style={styles.brandLogo}>
              <Image source={{ uri: brand.logo }} style={styles.brandImage} />
            </View>
            <Text style={styles.brandName}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderBestSelling = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover our Best Selling</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bestSellingProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate("ProductDetail", { product: item })}
            style={styles.horizontalProductCard}
          />
        )}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  )

  const renderTestimonials = () => (
    <View style={styles.testimonialsSection}>
      <Text style={styles.testimonialsTitle}>WHAT OUR CUSTOMERS SAY</Text>

      <FlatList
        data={testimonials}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.testimonialInfo}>
                <Text style={styles.testimonialName}>{item.name}</Text>
                <View style={styles.testimonialRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"}
                      size={14}
                      color={colors.warning}
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.testimonialComment}>{item.comment}</Text>
          </View>
        )}
        contentContainerStyle={styles.testimonialsContainer}
      />
    </View>
  )

  const cardGap = spacing.md;
  const cardWidth = (width - cardGap * 3) / 2;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeroSection()}
        {renderCategories()}
        {renderProductsSection()}
        {renderBrands()}
        {renderBestSelling()}
        {renderTestimonials()}

        {/* All Products Infinite Scroll Section */}
        <View style={styles.allProductsSection}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <FlatList
            style={{ width: '100%' }}
            data={products.slice(0, visibleProductCount)}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            renderItem={({ item, index }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate("ProductDetail", { product: item })}
                style={[
                  styles.verticalProductCard,
                  { width: cardWidth, marginLeft: cardGap, marginRight: index % 2 === 1 ? cardGap : 0 },
                ]}
              />
            )}
            onEndReached={handleLoadMoreProducts}
            onEndReachedThreshold={0.5}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </View>

        {/* Footer
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <Text style={styles.footerTitle}>NM Naigaon Market</Text>
              <Text style={styles.footerText}>
                Naigaon Market promotes a circular economy where money spent stays within the community. It helps small
                businesses embrace digital tools, preparing them for larger markets, and fosters local economic growth.
              </Text>
              <Text style={styles.footerContact}>📞 +91-93703-94747</Text>
              <Text style={styles.footerAddress}>
                Address: 205, Jag Vijay Building 3, Naigaon East, Maharashtra, India
              </Text>
              <Text style={styles.footerEmail}>naigaonmarket@gmail.com</Text>
            </View>

            <View style={styles.footerLinks}>
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Quick Links</Text>
                <Text style={styles.footerLink}>About</Text>
                <Text style={styles.footerLink}>Shop</Text>
                <Text style={styles.footerLink}>Contact</Text>
                <Text style={styles.footerLink}>Blog</Text>
              </View>

              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Resources</Text>
                <Text style={styles.footerLink}>Terms of Service</Text>
                <Text style={styles.footerLink}>Privacy Policy</Text>
                <Text style={styles.footerLink}>Shipping Policy</Text>
                <Text style={styles.footerLink}>Return Policy</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.copyright}>© 2025 Naigaon Market. All rights reserved.</Text>
          </View>
        </View> */}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.md / 2,
    width: width - spacing.md * 2,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: "center",
  },
  dealBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    zIndex: 1,
  },
  dealBadgeText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  discountBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.deal,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  heroImageContainer: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  heroImage: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  heroInfo: {
    alignItems: "center",
  },
  heroProductName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  stars: {
    flexDirection: "row",
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  reviewsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
  },
  heroPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  heroPrice: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  heroOriginalPrice: {
    fontSize: typography.sizes.lg,
    color: colors.text.light,
    textDecorationLine: "line-through",
  },
  stockStatus: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    marginBottom: spacing.md,
  },
  dealButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  dealButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },

  // Section Styles
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  // Categories
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  categoryItem: {
    alignItems: "center",
    width: (width - spacing.md * 2) / 4,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    textAlign: "center",
    fontWeight: typography.weights.medium,
  },

  // Products
  horizontalList: {
    paddingRight: spacing.md,
  },
  horizontalProductCard: {
    marginRight: spacing.md,
    width: 180,
  },

  // Brands
  brandsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  brandItem: {
    alignItems: "center",
    width: (width - spacing.md * 2) / 4,
    marginBottom: spacing.md,
  },
  brandLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  brandImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  brandName: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    textAlign: "center",
  },

  // Testimonials
  testimonialsSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  testimonialsTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  testimonialsContainer: {
    paddingRight: spacing.md,
  },
  testimonialCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: width * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  testimonialRating: {
    flexDirection: "row",
  },
  testimonialComment: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // View All Products Section
  allProductsSection: {
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.md,
    marginTop: 0,
  },
  viewAllProductsButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: spacing.md,
  },
  viewAllProductsButtonText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  verticalProductCard: {
    marginBottom: spacing.md,
  },

  // Footer
  footer: {
    backgroundColor: colors.text.primary,
    padding: spacing.lg,
  },
  footerContent: {
    marginBottom: spacing.lg,
  },
  footerSection: {
    marginBottom: spacing.lg,
  },
  footerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.background,
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footerContact: {
    fontSize: typography.sizes.sm,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  footerAddress: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  footerEmail: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerColumn: {
    flex: 1,
  },
  footerColumnTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.background,
    marginBottom: spacing.sm,
  },
  footerLink: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    alignItems: "center",
  },
  copyright: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
  },
})

export default HomeScreen
