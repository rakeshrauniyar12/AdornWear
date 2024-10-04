import {
  Client,
  Account,
  ID,
  Databases,
  Storage,
  Query,
  Functions,
} from "appwrite";
import conf from "../conf/conf.js";
import { toast } from "react-toastify";

export class Service {
  client = new Client();
  account;
  databases;
  buckcet;
  functions;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.buckcet = new Storage(this.client);
    this.functions = new Functions(this.client);
  }

  async updateOrder(orderId, products) {
    try {
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteOrdersCollectionId,
        orderId,
        products
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteOrdersCollectionId,
        orderId
      );
      return response;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async placeOrder(amount, currency, receipt) {
    try {
      const response = await this.functions.createExecution(
        conf.appwriteFunctionId,
        JSON.stringify({
          amount,
          currency,
          receipt,
        })
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      if (userAccount) {
        const userId = userAccount.$id;
        const carts_id = ID.unique();
        await this.databases.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteUsersCollectionId,
          userId,
          {
            email,
            name,
            userdp: "",
            viewedProducts: [],
            carts_id,
          }
        );

        await this.databases.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCartsCollectionId,
          carts_id,
          {
            cartProduct_Id: [],
          }
        );
        toast.success("Registered user successfully!");
        return userAccount;
      }
    } catch (error) {
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    if (this.account) {
      return await this.account.get();
    } else {
      return null;
    }
  }

  async logout() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      throw error;
    }
  }

  async reauthenticateUser(email, password) {
    try {
      const res = await this.account.createJWT(email, password);
    } catch (error) {
      throw error;
    }
  }

  async fetchProducts() {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async fetchCategories() {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCategoryCollectionId
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      // Fetch the user's cart
      const userDoc = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUsersCollectionId,
        userId
      );
      const cartId = userDoc.carts_id.$id;
      const cartProducts = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCartsCollectionId,
        [Query.equal("$id", cartId)]
      );

      // Delete each cart product
      const deletePromises = cartProducts.documents.map((cartProduct) => {
        return cartProduct.cartProduct_Id.map((cartProduct) => {
          return this.databases.deleteDocument(
            conf.appwriteDatabaseId,
            conf.appwriteCartProductCollectionId,
            cartProduct.$id
          );
        });
      });

      // Wait for all delete operations to complete
      await Promise.all(deletePromises);

      // Clear the cart product IDs in the user's cart document
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartsCollectionId,
        cartId,
        {
          cartProduct_Id: [],
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async fetchProductsByCategory(categoryName) {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        [Query.equal("category", categoryName)]
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async submitReview({
    productId,
    userId,
    rating,
    headline,
    comment,
    timeStamp,
  }) {
    if (!productId || !userId || !rating || !headline || !comment) {
      toast.warning("All fields must be filled out");
    }

    try {
      const response = await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteReviewsCollectionId,
        ID.unique(),
        {
          comment,
          headline,
          productId,
          rating,
          timeStamp,
          userId,
        }
      );
      toast.success("Review added to Appwrite successfully", {
        autoClose: 1500,
      });
    } catch (error) {
      toast.error("Error adding review to Appwrite: " + error.message, {
        autoClose: 1500,
      });
      throw error;
    }
  }

  async fetchReviews(productId) {
    try {
      const reviewsSnapshot = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteReviewsCollectionId,
        [Query.equal("productId", productId)]
      );
      const reviewsData = reviewsSnapshot.documents.map(async (doc) => {
        const reviewData = doc;
        const userDoc = await this.databases.getDocument(
          conf.appwriteDatabaseId,
          conf.appwriteUsersCollectionId,
          reviewData.userId
        );
        const userData = userDoc
          ? {
              name: userDoc.name || "Anonymous",
              userdp: userDoc.userdp || "",
            }
          : { name: "Anonymous", userdp: "" };
        return {
          ...reviewData,
          userName: userData.name,
          userdp: userData.userdp,
          reviewedDate: new Date(reviewData.timeStamp).toLocaleDateString(
            "en-GB",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          ),
        };
      });
      const resolvedReviews = await Promise.all(reviewsData);
      return {
        ModifiedReviews: resolvedReviews,
        Reviews: reviewsSnapshot.documents,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProductRatings(productId, averageRating, globalRatings) {
    try {
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        productId,
        {
          productRating: averageRating,
          productReviews: globalRatings,
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        [Query.contains("searchTerms", [query])]
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async fetchCartProducts(user) {
    try {
      const cartId = user.carts_id;
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartsCollectionId,
        cartId.$id
      );
    } catch (error) {
      throw error;
    }
  }

  async updateProductQuantity(productId, data) {
    try {
      const product = await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        productId,
        data
      );
      return product;
    } catch (error) {
      throw error;
    }
  }

  async fetchProductById(productId) {
    try {
      const product = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        productId
      );
      return product;
    } catch (error) {
      return [];
    }
  }

  async updateViewedProducts(userId, productId) {
    try {
      const userData = await this.getUserData(userId);
      let viewedProducts = userData.viewedProducts || [];

      viewedProducts = [
        productId,
        ...viewedProducts.filter((id) => id !== productId),
      ];

      if (viewedProducts.length > 10) {
        viewedProducts = viewedProducts.slice(0, 10);
      }

      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUsersCollectionId,
        userId,
        {
          viewedProducts: viewedProducts,
        }
      );
      return viewedProducts;
    } catch (error) {
      throw error;
    }
  }

  async fetchSimilarProductsByBrand(brand, productId) {
    try {
      // Fetch product data to get category
      const productData = await this.fetchProductById(productId);
      const category = productData.category;

      // Fetch similar products by brand and category
      const similarProductsSnapshot = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        [
          Query.equal("productBrand", brand),
          Query.equal("category", category),
          Query.limit(10),
        ]
      );

      const similarProductsData = similarProductsSnapshot.documents
        .filter((product) => product.$id !== productId)
        .map((product) => ({
          ...product,
          productId: product.$id, // Assuming product id is stored in $id
        }));

      return similarProductsData;
    } catch (error) {
      throw error;
    }
  }

  async fetchRecommendedProductsByCategory(category, productId) {
    try {
      // Fetch recommended products by category
      const recommendedProductsSnapshot = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteProductCollectionId,
        [Query.equal("category", category), Query.limit(10)]
      );

      const recommendedProductsData = recommendedProductsSnapshot.documents
        .filter((product) => product.$id !== productId)
        .map((product) => ({
          ...product,
          productId: product.$id, // Assuming product id is stored in $id
        }));

      return recommendedProductsData;
    } catch (error) {
      throw error;
    }
  }

  async getUserData(userId) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteUsersCollectionId,
        userId
      );
    } catch (error) {
      throw error;
    }
  }

  async getOrders(userId) {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteOrdersCollectionId,
        [Query.equal("userId", userId)]
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async getReturnOrders(userId) {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteReturnOrderCollectionId,
        [Query.equal("userId", userId)]
      );
      return response.documents;
    } catch (error) {
      throw error;
    }
  }

  async addAddress(userId, mobileNumber, shippingAddress) {
    try {
      await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteAddressCollectionId,
        ID.unique(),
        {
          userId: userId,
          mobileNumber: mobileNumber,
          shippingAddress: shippingAddress,
        }
      );
    } catch (error) {
      throw error;
    }
  }
  async removeAddress(addressId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteAddressCollectionId,
        addressId
      );
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteOrdersCollectionId,
        orderId,
        {
          isCancel: true,
        }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getAddresses(userId) {
    try {
      const response = await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteAddressCollectionId,
        [Query.equal("userId", userId)]
      );
      return response.documents;
    } catch (error) {
      return [];
    }
  }

  async addOrder({
    userId,
    products,
    address,
    mobileNumber,
    orderAmount,
    paymentMethod,
    paymentId,
  }) {
    try {
      await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteOrdersCollectionId,
        ID.unique(),
        {
          userId,
          products,
          address,
          mobileNumber,
          orderAmount,
          paymentMethod,
          paymentId,
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async addToCart(user, productId, selectedValue, selectedColor) {
    try {
      if (!user) {
        throw new Error("User is not authenticated. Please log in.");
      }

      // if (selectedValue === "Choose your size") {
      //   throw new Error("Please select a size.");
      // }

      const cartId = user.carts_id;
      const cartRef = this.databases;

      // Fetch or create the cart
      let cart;
      if (cartId) {
        cart = await cartRef.getDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCartsCollectionId,
          cartId.$id
        );
      } else {
        cart = await cartRef.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCartsCollectionId,
          ID.unique(),
          {
            cartProduct_Id: [],
          }
        );
        user.carts_id = cart.$id;
        await this.databases.updateDocument(
          conf.appwriteDatabaseId,
          conf.appwriteUsersCollectionId,
          user.$id,
          {
            carts_id: cart.$id,
          }
        );
      }

      let isProduct = false;

      // Check if the product is already in the cart
      for (const cartProductId of cart.cartProduct_Id) {
        const cartProductDocumentId = cartProductId.$id;
        const cartProduct = await cartRef.getDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCartProductCollectionId,
          cartProductDocumentId
        );

        if (
          cartProduct.cartProductSize === selectedValue &&
          cartProduct.product_id === productId
        ) {
          isProduct = true;
          break; // Exit loop early if product is found
        }
      }

      if (isProduct) {
        toast.warn("Product already in the cart!", {
          autoClose: 1500,
        });
        return;
      }
      // Create new cart product document
      const cartProduct = await cartRef.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartProductCollectionId,
        ID.unique(),
        {
          product_id: productId,
          cartProductQuantity: 1,
          cartProductSize: selectedValue,
          selectedColor: selectedColor,
        }
      );

      // Update the cart with the new cartProductId
      await cartRef.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartsCollectionId,
        cart.$id,
        {
          cartProduct_Id: [...cart.cartProduct_Id, cartProduct.$id],
        }
      );

      toast.success("Product added to cart successfully!", {
        autoClose: 1500,
      });
    } catch (error) {
      toast.warn(error.message, {
        autoClose: 1500,
      });
    }
  }

  async updateCartProductQuantity(cartProductId, newQuantity) {
    try {
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartProductCollectionId,
        cartProductId,
        {
          cartProductQuantity: newQuantity,
        }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add this method to remove a product from the cart
  async removeCartProduct(cartId, cartProductId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartProductCollectionId,
        cartProductId
      );

      const cart = await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartsCollectionId,
        cartId
      );
      const updatedProductIds = cart.cartProduct_Id.filter(
        (id) => id !== cartProductId
      );
      await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCartsCollectionId,
        cartId,
        {
          cartProduct_Id: updatedProductIds,
        }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateUserName(name) {
    try {
      await this.account.updateName(name);
      toast.success("User name updated successfully!");
      return true;
    } catch (error) {
      toast.error("Error updating user name: " + error.message);
    }
  }

  async updateUserPassword(newPassword) {
    try {
      const res = await this.account.updatePassword(newPassword);
      toast.success("Password updated successfully!");
      return true;
    } catch (error) {
      toast.error("Error updating password: " + error.message);
    }
  }

  async handleContinueWithGoogle() {
    this.account.createOAuth2Session(
      "google",
      "https://zorawear.vercel.app/",
      "https://zorawear.vercel.app/fail"
    );
  }

  // async sendOtp(phoneNumber) {
  //   try {
  //     const response = await this.functions.createExecution(
  //       conf.sendOtpFunctionId,
  //       JSON.stringify({ phoneNumber })
  //     );
  //     console.log("Send Otp Responses:", response);
  //     return response;
  //   } catch (error) {
  //     console.error("Error sending OTP:", error);
  //     throw error;
  //   }
  // }

  // async verifyOtp(phoneNumber, otp) {
  //   try {
  //     const response = await this.functions.createExecution(
  //       conf.sendOtpFunctionId,
  //       JSON.stringify({ phoneNumber, otp })
  //     );
  //     console.log("Verify Otp Responses:", response);
  //     return response;
  //   } catch (error) {
  //     console.error("Error verifying OTP:", error);
  //     throw error;
  //   }
  // }
}

const services = new Service();

export default services;
