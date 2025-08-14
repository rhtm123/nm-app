import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { searchService } from '../services/searchService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../theme'

const SearchScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()
  const searchInputRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState({ categories: [], products: [], totalProducts: 0 })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadRecentSearches()
  }, [])

  useEffect(() => {
    // Auto-focus search input
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }, [])

  useEffect(() => {
    // Check if there's a query parameter from navigation
    if (route.params?.initialQuery) {
      const query = route.params.initialQuery;
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [route.params?.initialQuery]);

  useEffect(() => {
    // Debounce suggestions
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchSuggestions(searchQuery)
      } else {
        setSuggestions({ categories: [], brands: [] })
        setShowSuggestions(false)
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery])

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error)
    }
  }

  const saveRecentSearch = async (query) => {
    try {
      const updatedSearches = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 10)
      setRecentSearches(updatedSearches)
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Error saving recent search:", error)
    }
  }

  const fetchSuggestions = async (query) => {
    try {
      setLoadingSuggestions(true)
      const [categoriesResult, brandsResult] = await Promise.all([
        searchService.autocompleteCategories(query),
        searchService.autocompleteBrands(query),
      ])

      const allSuggestions = []

      if (categoriesResult.success && categoriesResult.data) {
        categoriesResult.data.forEach((item) => {
          allSuggestions.push({ type: 'category', name: item, id: item })
        })
      }

      if (brandsResult.success && brandsResult.data) {
        brandsResult.data.forEach((item) => {
          allSuggestions.push({ type: 'brand', name: item, id: item })
        })
      }

      setSuggestions(allSuggestions.slice(0, 10))
      setShowSuggestions(allSuggestions.length > 0)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const performSearch = async (query) => {
    if (!query.trim()) return

    try {
      setIsSearching(true)
      setShowSuggestions(false)
      setShowResults(true)

      const [productRes, catRes] = await Promise.all([
        searchService.searchProducts(query),
        searchService.searchCategories(query),
      ])

      // Handle the API response format - products come in 'hits' array
      const products = productRes.success ? (productRes.data.hits || []) : []
      const categories = catRes.success ? (catRes.data.hits || catRes.data.results || []) : []
      
      setSearchResults({
        categories,
        products,
        totalProducts: productRes.success ? (productRes.data.estimatedTotalHits || products.length) : 0
      })
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults({ categories: [], products: [], totalProducts: 0 })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = (query) => {
    if (!query.trim()) return
    saveRecentSearch(query)
    performSearch(query)
    Keyboard.dismiss()
  }

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion.name)
    handleSearch(suggestion.name)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }





  const renderSearchInput = () => (
    <View className="bg-white px-4 py-3 border-b border-blue-100 shadow-sm">
      <View className="flex-row items-center bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
        <Ionicons name="search" size={20} color={colors.primary} />
        <TextInput
          ref={searchInputRef}
          className="flex-1 ml-3 text-base text-gray-900"
          placeholder="Search products and services..."
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  const renderSimpleSuggestion = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      onPress={() => handleSuggestionPress(item)}
    >
      <Ionicons
        name={item.type === 'category' ? 'grid-outline' : 'business-outline'}
        size={18}
        color="#6b7280"
      />
      <Text className="flex-1 ml-3 text-base text-gray-900">{item.name}</Text>
      <Text className="text-sm text-blue-600 capitalize">{item.type}</Text>
    </TouchableOpacity>
  )

  const renderEmptySearch = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name="search-outline" size={80} color="#9ca3af" />
      <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Search Products</Text>
      <Text className="text-base text-gray-500 text-center mb-8">
        Find products, categories, and brands
      </Text>
      
      {recentSearches.length > 0 && (
        <View className="w-full">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="flex-row items-center px-4 py-3 border-b border-gray-100"
                onPress={() => handleSearch(item)}
              >
                <Ionicons name="time-outline" size={18} color="#6b7280" />
                <Text className="flex-1 ml-3 text-base text-gray-900">{item}</Text>
              </TouchableOpacity>
            )}
            className="bg-white rounded-lg"
          />
        </View>
      )}
    </View>
  )

  return (
    <View className="flex-1 bg-gray-50">
      {renderSearchInput()}
      
      {showSuggestions && (
        <View className="bg-white border-b border-gray-200 max-h-80">
          {loadingSuggestions ? (
            <View className="py-8">
              <LoadingSpinner />
            </View>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
              renderItem={renderSimpleSuggestion}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}

      {!showSuggestions && (
        <View className="flex-1">
          {isSearching ? (
            <LoadingSpinner />
          ) : showResults ? (
            <FlatList
              data={searchResults.products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="w-1/2 px-1">
                  <ProductCard
                    productListing={item}
                    onPress={() => navigation.navigate('ProductDetail', { productListing: item })}
                    className="mb-2"
                  />
                </View>
              )}
              numColumns={2}
              contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
              ListHeaderComponent={() => (
                searchResults.totalProducts > 0 ? (
                  <Text className="text-lg font-semibold text-gray-900 p-4">
                    {searchResults.totalProducts} results for "{searchQuery}"
                  </Text>
                ) : (
                  <View className="flex-1 justify-center items-center py-20">
                    <Ionicons name="search-outline" size={80} color="#9ca3af" />
                    <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">No Results Found</Text>
                    <Text className="text-base text-gray-500 text-center">
                      Try searching with different keywords
                    </Text>
                  </View>
                )
              )}
            />
          ) : (
            renderEmptySearch()
          )}
        </View>
      )}
    </View>
  )
}


export default SearchScreen
