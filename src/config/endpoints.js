export const API_ENDPOINTS = {
    // Authentication & Users
    SEND_OTP: "/api/user/send-otp/",
    VERIFY_OTP: "/api/user/verify-otp/",
    USERS: "/api/user/users/",
    USER_BY_ID: (id) => `/api/user/users/${id}/`,
    LOGIN: "/api/user/auth/login/",
    GOOGLE_LOGIN: "/api/user/auth/google/",
    SHIPPING_ADDRESSES: "/api/user/shipping-addresses/",
    SHIPPING_ADDRESS_BY_ID: (id) => `/api/user/shipping-addresses/${id}/`,
  
    // Products
    PRODUCTS: "/api/product/products/",
    PRODUCT_BY_ID: (id) => `/api/product/products/${id}/`,
    PRODUCT_LISTINGS: "/api/product/product-listings/",
    PRODUCT_LISTING_BY_ID: (id) => `/api/product/product-listings/${id}/`,
    PRODUCT_LISTING_BY_SLUG: (slug) => `/api/product/product-listings/slug/${slug}/`,
    RELATED_PRODUCTS: (id) => `/api/product/product-listings/related/${id}/`,
    CATEGORIES: "/api/product/categories/",
    CATEGORY_BY_ID: (id) => `/api/product/categories/${id}/`,
    CATEGORY_BY_SLUG: (slug) => `/api/product/categories/slug/${slug}/`,
    CATEGORY_PARENTS_CHILDREN: (id) => `/api/product/categories/parents-children/${id}/`,
    SIDEBAR_FILTERS: "/api/product/sidebar-filters/",
    PRODUCT_LISTING_IMAGES: "/api/product/product-listing-images/",
    FEATURES: "/api/product/features/",
  
    // Search
    SEARCH_PRODUCTS: "/api/search/products",
    SEARCH_CATEGORIES: "/api/search/categories",
    SEARCH_BRANDS: "/api/search/brands",
    AUTOCOMPLETE_PRODUCTS: "/api/search/autocomplete/products",
    AUTOCOMPLETE_CATEGORIES: "/api/search/autocomplete/categories",
    AUTOCOMPLETE_BRANDS: "/api/search/autocomplete/brands",
  
    // Cart
    CARTS: "/api/cart/carts/",
    CART_BY_ID: (id) => `/api/cart/carts/${id}/`,
    CART_ITEMS: "/api/cart/cart-items/",
    CART_ITEM_BY_ID: (id) => `/api/cart/cart-items/${id}/`,
    WISHLISTS: "/api/cart/wishlists/",
    WISHLIST_ITEMS: "/api/cart/wishlist_items/",
  
    // Orders
    ORDERS: "/api/order/orders/",
    ORDER_BY_ID: (id) => `/api/order/orders/${id}/`,
    ORDER_ITEMS: "/api/order/order-items/",
    DELIVERY_STATUS: (orderNumber) => `/api/order/delivery-status/${orderNumber}`,
  
    // Payments
    PAYMENTS: "/api/payment/payments/",
    VERIFY_PAYMENT: "/api/payment/verify-payment",
    PHONEPE_WEBHOOK: "/api/payment/phonepe-webhook/",
  
    // Reviews
    REVIEWS: "/api/review/reviews/",
    REVIEW_BY_ID: (id) => `/api/review/reviews/${id}/`,
    REVIEW_BY_ORDER_ITEM: (id) => `/api/review/reviews/order-item/${id}/`,
  
    // Advertisements
    ADVERTISEMENTS: "/api/ads/advertisements",
  
    // Coupons & Offers
    COUPONS: "/api/offer/coupons",
    COUPON_BY_ID: (id) => `/api/offer/coupons/${id}`,
    VALIDATE_COUPON: (code) => `/api/offer/validate-coupon/${code}`,
    OFFERS: "/api/offer/offers",
    VALIDATE_OFFER: (id) => `/api/offer/validate-offer/${id}`,
    PRODUCT_OFFERS: "/api/offer/product-offers",
    PRODUCT_OFFERS_BY_ID: (id) => `/api/offer/product-offers/${id}/`,
  
    // Locations
    ADDRESSES: "/api/location/addresses/",
    ADDRESS_BY_ID: (id) => `/api/location/addresses/${id}/`,
  
    // Delivery
    DELIVERY_PINS: "/api/estore/delivery-pins/",
  
    // Blogs
    BLOGS: "/api/blog/blogs",
    BLOG_BY_ID: (id) => `/api/blog/blogs/${id}`,
    BLOG_BY_SLUG: (slug) => `/api/blog/blogs/slug/${slug}`,
    BLOG_TAGS: "/api/blog/tags",
  }
  