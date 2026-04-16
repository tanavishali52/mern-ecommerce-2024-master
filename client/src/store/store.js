import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminOrderSlice from "./admin/order-slice";
import adminSettingsSlice from "./admin/settings-slice";

import shopProductsSlice from "./shop/products-slice";
import shopCartSlice from "./shop/cart-slice";
import shopWishlistSlice from "./shop/wishlist-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";
import shopGuestCheckoutSlice from "./shop/guest-checkout-slice";
import shopOrderConfirmationSlice from "./shop/order-confirmation-slice";
import shopGuestOrderLookupSlice from "./shop/guest-order-lookup-slice";
import commonFeatureSlice from "./common-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,
    adminSettings: adminSettingsSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopWishlist: shopWishlistSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
    shopGuestCheckout: shopGuestCheckoutSlice,
    shopOrderConfirmation: shopOrderConfirmationSlice,
    shopGuestOrderLookup: shopGuestOrderLookupSlice,

    commonFeature: commonFeatureSlice,
  },
});

export default store;
