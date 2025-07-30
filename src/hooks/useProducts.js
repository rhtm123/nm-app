"use client"

import { useState, useEffect } from "react"
import { productService } from "../services/productService"
import { useApi } from "./useApi"

export const useProductListings = (params = {}) => {
  return useApi(() => productService.getProductListings(params), params, [JSON.stringify(params)])
}

export const useProductListing = (listingId) => {
  return useApi(() => productService.getProductListingById(listingId), listingId, [listingId])
}

export const useProductVariants = (productId) => {
  return useApi(() => productService.getProductVariants(productId), productId, [productId])
}

export const useProductDetails = (productId) => {
  return useApi(() => productService.getProductById(productId), productId, [productId])
}

export const useCategories = (params = {}) => {
  return useApi(() => productService.getCategories(params), params, [JSON.stringify(params)])
}

export const useRelatedProducts = (listingId, params = {}) => {
  return useApi(() => productService.getRelatedProducts(listingId, params), { listingId, ...params }, [
    listingId,
    JSON.stringify(params),
  ])
}

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const result = await productService.getFeaturedProductListings()

        if (result.success) {
          setFeaturedProducts(result.data.results || [])
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return { featuredProducts, loading, error }
}

export const useProductsByCategory = (categoryId, params = {}) => {
  return useApi(() => productService.getProductsByCategory(categoryId, params), { categoryId, ...params }, [
    categoryId,
    JSON.stringify(params),
  ])
}

export const useSearchProducts = (searchQuery, params = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchProducts = async (query, searchParams = {}) => {
    if (!query.trim()) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await productService.searchProducts(query, searchParams)

      if (result.success) {
        setProducts(result.data.results || [])
      } else {
        setError(result.error)
        setProducts([])
      }
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      searchProducts(searchQuery, params)
    } else {
      setProducts([])
    }
  }, [searchQuery, JSON.stringify(params)])

  return { products, loading, error, searchProducts }
}
