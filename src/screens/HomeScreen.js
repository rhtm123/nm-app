import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"
import ProductCard from "../components/ProductCard"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import { useProductListings, useCategories, useFeaturedProducts } from "../hooks/useProducts"
import { colors, spacing, typography } from "../theme"
import Header from '../components/Header';

const { width } = Dimensions.get("window")

// --- Product Card (Reusable) ---
const ProductCardModern = ({ item, navigation }) => (
  <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productListing: item })} activeOpacity={0.8}>
    <View style={stylesModern.productCard}>
      <Image
        source={item.main_image ? { uri: item.main_image } : require('../../assets/placeholder.png')}
        style={stylesModern.productImage}
        resizeMode="cover"
      />
      <Text style={stylesModern.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={stylesModern.productPrice}>{item.price ? `₹${item.price}` : 'Contact for price'}</Text>
      <TouchableOpacity style={stylesModern.addButton}>
        <Text style={stylesModern.addButtonText}>ADD</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
)

// --- Category Card (Reusable) ---
const CategoryCardModern = ({ item, navigation }) => (
  <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: item })} activeOpacity={0.8}>
    <View style={stylesModern.categoryCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={stylesModern.categoryImage} resizeMode="cover" />
      ) : (
        <Ionicons name="cube" size={32} color={colors.primary} />
      )}
      <Text style={stylesModern.categoryName} numberOfLines={2}>{item.name}</Text>
    </View>
  </TouchableOpacity>
)

const HomeScreen = () => {
  const navigation = useNavigation()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch data using custom hooks
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProductListings({ page_size: 20 })
  const {
    data: categoriesData,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories({ page_size: 10 })
  const { featuredProducts, loading: featuredLoading, error: featuredError } = useFeaturedProducts()

  const products = productsData?.results || []
  const categories = categoriesData?.results || []

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchProducts(), refetchCategories()])
    setRefreshing(false)
  }

  // --- Update renderMainCategories ---
  const renderMainCategories = () => (
    <View style={stylesModern.section}>
      <FlatList
        data={categories.slice(0, 5)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CategoryCardModern item={item} navigation={navigation} />}
        contentContainerStyle={stylesModern.horizontalList}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />
    </View>
  )

  const renderPromotionalBanner = () => (
    <View style={styles.promotionalBanner}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>Hariyali Teej</Text>
        <Text style={styles.bannerSubtitle}>Celebrate with us</Text>
        <TouchableOpacity style={styles.bannerButton}>
          <Text style={styles.bannerButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bannerImage}>
        <Ionicons name="flower" size={40} color={colors.background} />
      </View>
    </View>
  )

  const renderSubPromotions = () => (
    <View style={styles.subPromotionsSection}>
      <FlatList
        data={[
          { title: "Shimmer & Mehndi", icon: "sparkles", color: "#FF6B6B" },
          { title: "Gifts Corner", icon: "gift", color: "#4ECDC4" },
          { title: "Teej Specials", icon: "heart", color: "#45B7D1" }
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.subPromotionCard, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={24} color={colors.background} />
            <Text style={styles.subPromotionText}>{item.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.subPromotionsList}
      />
    </View>
  )

  // --- Update renderPreviouslyBought ---
  const renderPreviouslyBought = () => {
    if (productsLoading) return <LoadingSpinner />
    if (productsError) return <ErrorMessage message={productsError} onRetry={refetchProducts} />
    if (!products || products.length === 0) return null

    return (
      <View style={stylesModern.section}>
        <View style={stylesModern.sectionHeader}>
          <Text style={stylesModern.sectionTitle}>Previously bought</Text>
          <TouchableOpacity>
            <Text style={stylesModern.viewAllText}>See all products</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={products.slice(0, 5)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ProductCardModern item={item} navigation={navigation} />}
          contentContainerStyle={stylesModern.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        />
      </View>
    )
  }

  const renderFeaturedWeek = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Featured this week</Text>
      <FlatList
        data={[
          { title: "Family Essentials", color: "#FF9500", icon: "people" },
          { title: "Saddhnu Sawan", color: "#007AFF", icon: "leaf" },
          { title: "TRENDING NEAR YOU", color: "#5856D6", icon: "trending-up" }
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.featuredCard, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={24} color={colors.background} />
            <Text style={styles.featuredCardText}>{item.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.featuredList}
      />
    </View>
  )

  const renderMegaSale = () => (
    <View style={styles.megaSaleSection}>
      <View style={styles.megaSaleBanner}>
        <Text style={styles.megaSaleTitle}>MEGA CLEANING SALE</Text>
        <Text style={styles.megaSaleSubtitle}>Powered by top brands</Text>
        <TouchableOpacity style={styles.megaSaleButton}>
          <Text style={styles.megaSaleButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.megaSaleSubCards}>
        <View style={styles.megaSaleSubCard}>
          <Text style={styles.megaSaleSubCardTitle}>Starting at ₹99</Text>
        </View>
        <View style={styles.megaSaleSubCard}>
          <Text style={styles.megaSaleSubCardTitle}>Cleaning & Hygiene</Text>
        </View>
        <View style={styles.megaSaleSubCard}>
          <Text style={styles.megaSaleSubCardTitle}>Laundry & Freshness</Text>
        </View>
      </View>
    </View>
  )

  // --- Update renderCategoryGrid ---
  const renderCategoryGrid = () => {
    if (categoriesLoading) return <LoadingSpinner />
    if (!categories || categories.length === 0) return null

    const categoryGroups = [
      { title: "Grocery & Kitchen", categories: categories.slice(0, 4) },
      { title: "Snacks & Drinks", categories: categories.slice(4, 8) },
      { title: "Beauty & Personal Care", categories: categories.slice(0, 4) },
      { title: "Household Essentials", categories: categories.slice(4, 8) }
    ]

    return (
      <View style={stylesModern.section}>
        {categoryGroups.map((group, index) => (
          <View key={index} style={stylesModern.categoryGroup}>
            <Text style={stylesModern.categoryGroupTitle}>{group.title}</Text>
            <View style={stylesModern.categoryGrid}>
              {group.categories.map((category) => (
                <CategoryCardModern key={category.id} item={category} navigation={navigation} />
              ))}
            </View>
          </View>
        ))}
      </View>
    )
  }

  const renderZomatoVoucher = () => (
    <View style={styles.zomatoVoucherSection}>
      <View style={styles.zomatoVoucherCard}>
        <View style={styles.zomatoVoucherContent}>
          <Text style={styles.zomatoVoucherTitle}>zomato voucher worth ₹100</Text>
          <Text style={styles.zomatoVoucherSubtitle}>on Blinkit orders above ₹799</Text>
        </View>
        <View style={styles.zomatoVoucherIcon}>
          <Ionicons name="restaurant" size={32} color={colors.background} />
        </View>
      </View>
    </View>
  )

  const renderShopByStore = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shop by store</Text>
      <View style={styles.storeGrid}>
        {[
          { name: "Spiritual Store", icon: "flower" },
          { name: "Pharma Store", icon: "medical" },
          { name: "Pet Store", icon: "paw" },
          { name: "Sports Store", icon: "football" },
          { name: "Toy Store", icon: "game-controller" }
        ].map((store, index) => (
          <TouchableOpacity key={index} style={styles.storeItem}>
            <View style={styles.storeIcon}>
              <Ionicons name={store.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  // --- Update renderProductSection ---
  const renderProductSection = (title, products, showRating = true) => {
    if (productsLoading) return <LoadingSpinner />
    if (productsError) return <ErrorMessage message={productsError} onRetry={refetchProducts} />
    if (!products || products.length === 0) return null

    return (
      <View style={stylesModern.section}>
        <Text style={stylesModern.sectionTitle}>{title}</Text>
        <FlatList
          data={products.slice(0, 6)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ProductCardModern item={item} navigation={navigation} />}
          contentContainerStyle={stylesModern.horizontalList}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        />
      </View>
    )
  }

  const renderBottomBanner = () => (
    <View style={styles.bottomBanner}>
      <View style={styles.bottomBannerContent}>
        <Text style={styles.bottomBannerTitle}>Free Gift on Cleaning Essentials</Text>
        <Text style={styles.bottomBannerSubtitle}>on orders above ₹499</Text>
      </View>
      <TouchableOpacity style={styles.closeButton}>
        <Ionicons name="close" size={20} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <Header title="Naigaon Market" showSearch navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header is now handled by the navigation stack */}
        {renderMainCategories()}
        {renderPromotionalBanner()}
        {renderSubPromotions()}
        {renderPreviouslyBought()}
        {renderFeaturedWeek()}
        {renderMegaSale()}
        {renderCategoryGrid()}
        {renderZomatoVoucher()}
        {renderShopByStore()}
        {renderProductSection("Define your style", products, false)}
        {renderProductSection("Price drop!", products)}
        {renderProductSection("Start your day right", products, false)}
      </ScrollView>
      {renderBottomBanner()}
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

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  deliveryText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  locationText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  userIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  userIcon: {
    marginLeft: spacing.md,
  },

  // Main Categories
  mainCategoriesSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
  },
  mainCategoriesList: {
    paddingHorizontal: spacing.md,
  },
  mainCategoryItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  mainCategoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mainCategoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  mainCategoryName: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },

  // Promotional Banner
  promotionalBanner: {
    backgroundColor: colors.success,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.background,
    marginBottom: spacing.md,
  },
  bannerButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
  bannerImage: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sub Promotions
  subPromotionsSection: {
    marginBottom: spacing.md,
  },
  subPromotionsList: {
    paddingHorizontal: spacing.md,
  },
  subPromotionCard: {
    padding: spacing.md,
    borderRadius: 8,
    marginRight: spacing.md,
    alignItems: 'center',
    minWidth: 100,
  },
  subPromotionText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  // Previously Bought
  previouslyBoughtList: {
    paddingHorizontal: spacing.md,
  },
  previouslyBoughtCard: {
    width: 120,
    marginRight: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previouslyBoughtImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  previouslyBoughtName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  previouslyBoughtPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  // Featured Week
  featuredList: {
    paddingHorizontal: spacing.md,
  },
  featuredCard: {
    padding: spacing.md,
    borderRadius: 8,
    marginRight: spacing.md,
    alignItems: 'center',
    minWidth: 120,
  },
  featuredCardText: {
    color: colors.background,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Mega Sale
  megaSaleSection: {
    margin: spacing.md,
  },
  megaSaleBanner: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  megaSaleTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  megaSaleSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.background,
    marginBottom: spacing.md,
  },
  megaSaleButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  megaSaleButtonText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  megaSaleSubCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  megaSaleSubCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  megaSaleSubCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Category Grid
  categoryGridSection: {
    marginBottom: spacing.lg,
  },
  categoryGroup: {
    marginBottom: spacing.lg,
  },
  categoryGroupTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  categoryGridItem: {
    width: (width - spacing.md * 3) / 4,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryGridIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryGridImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  categoryGridName: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },

  // Zomato Voucher
  zomatoVoucherSection: {
    margin: spacing.md,
  },
  zomatoVoucherCard: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zomatoVoucherContent: {
    flex: 1,
  },
  zomatoVoucherTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  zomatoVoucherSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.background,
  },
  zomatoVoucherIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Store Grid
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  storeItem: {
    width: (width - spacing.md * 3) / 3,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  storeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  storeName: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },

  // Product Cards
  productList: {
    paddingHorizontal: spacing.md,
  },
  productCard: {
    width: 140,
    marginRight: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  productName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },

  // Add Button
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  // Bottom Banner
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  bottomBannerContent: {
    flex: 1,
  },
  bottomBannerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.background,
  },
  bottomBannerSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.background,
  },
  closeButton: {
    padding: spacing.xs,
  },
})

// --- Modern Styles ---
const stylesModern = StyleSheet.create({
  section: {
    marginBottom: 28,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  // Product Card
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  productImage: {
    width: 120,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Category Card
  categoryCard: {
    width: 100,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginRight: 12,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  // Category Grid
  categoryGroup: {
    marginBottom: 18,
  },
  categoryGroupTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text.primary,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
})

export default HomeScreen
