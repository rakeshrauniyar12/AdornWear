const conf = {
  appwriteUrl: String(process.env.REACT_APP_APPWRITE_URL),
  appwriteProjectId: String(process.env.REACT_APP_APPWRITE_PROJECT_ID),
  appwriteDatabaseId: String(process.env.REACT_APP_APPWRITE_DATABASE_ID),
  appwriteCategoryCollectionId: String(
    process.env.REACT_APP_APPWRITE_CATEGORY_COLLECTION_ID
  ),
  appwriteProductCollectionId: String(
    process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID
  ),
  appwriteUsersCollectionId: String(
    process.env.REACT_APP_APPWRITE_USERS_COLLECTION_ID
  ),
  appwriteCartsCollectionId: String(
    process.env.REACT_APP_APPWRITE_CARTS_COLLECTION_ID
  ),
  appwriteCartProductCollectionId: String(
    process.env.REACT_APP_APPWRITE_CARTPRODUCT_COLLECTION_ID
  ),
  appwriteAddressCollectionId: String(
    process.env.REACT_APP_APPWRITE_ADDRESS_COLLECTION_ID
  ),
  appwriteOrdersCollectionId: String(
    process.env.REACT_APP_APPWRITE_ORDERS_COLLECTION_ID
  ),
  appwriteReviewsCollectionId: String(
    process.env.REACT_APP_APPWRITE_REVIEWS_COLLECTION_ID
  ),
  appwriteBucketId: String(process.env.REACT_APP_APPWRITE_BUCKET_ID),
  appwriteFunctionId: String(process.env.REACT_APP_APPWRITE_FUNCTION_ID),
  sendOtpFunctionId: String(process.env.REACT_APP_APPWRITE_SENDOTPFUNCTION_ID),
};

export default conf;
