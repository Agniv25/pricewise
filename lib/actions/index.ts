"use server";
import { User } from "@/types";
import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import {
  scrapeAmazonProduct,
  scrapePurplleProduct,
  scrapeAjioProduct,
  scrapeSnapdealProduct,
} from "../scraper";
import { getLowestPrice, getHighestPrice, getAveragePrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(
  productUrl: string,
  scrapeType: string
) {
  if (!productUrl) return;
  try {
    console.log("hello");
    await connectToDB();
    let scrapedProduct;
    switch (scrapeType) {
      case "amazon":
        scrapedProduct = await scrapeAmazonProduct(productUrl);
        break;
      case "purplle":
        scrapedProduct = await scrapePurplleProduct(productUrl);
        break;
      case "ajio":
        scrapedProduct = await scrapeAjioProduct(productUrl);
        break;
      case "snapdeal":
        scrapedProduct = await scrapeSnapdealProduct(productUrl);
        break;
    }

    if (!scrapedProduct) return;

    let product = scrapedProduct;
    console.log({ product });
    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];
      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }
    const newProduct = await Product.findOneAndUpdate(
      {
        url: scrapedProduct.url,
      },
      product,
      { upsert: true, new: true }
    );
    console.log(newProduct);
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    console.log(error.message);
    throw new Error(`Failed to create/update product:${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();
    const product = await Product.findOne({ _id: productId });

    if (!product) return;
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    const product = await Product.findById(productId);
    if (!product) return;

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );
    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();
      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
