import { create } from 'zustand'

const useOffersStore = create((set, get) => ({
  // Applied coupon
  appliedCoupon: null,
  
  // Applied offer
  appliedOffer: null,
  
  // Set applied coupon
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  
  // Set applied offer
  setAppliedOffer: (offer) => set({ appliedOffer: offer }),
  
  // Remove applied coupon
  removeAppliedCoupon: () => set({ appliedCoupon: null }),
  
  // Remove applied offer
  removeAppliedOffer: () => set({ appliedOffer: null }),
  
  // Clear all applied offers and coupons
  clearAll: () => set({ appliedCoupon: null, appliedOffer: null }),
  
  // Get total discount
  getTotalDiscount: () => {
    const { appliedCoupon, appliedOffer } = get()
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0
    const offerDiscount = appliedOffer ? appliedOffer.discount_amount : 0
    return couponDiscount + offerDiscount
  },
  
  // Get discount breakdown
  getDiscountBreakdown: () => {
    const { appliedCoupon, appliedOffer } = get()
    return {
      couponDiscount: appliedCoupon ? appliedCoupon.discount : 0,
      offerDiscount: appliedOffer ? appliedOffer.discount_amount : 0,
      totalDiscount: (appliedCoupon ? appliedCoupon.discount : 0) + (appliedOffer ? appliedOffer.discount_amount : 0),
      type: appliedCoupon ? 'coupon' : (appliedOffer ? 'offer' : null)
    }
  }
}))

export default useOffersStore 