import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import {
  scrapeAjioProduct,
  scrapeAmazonProduct,
  scrapePurplleProduct,
  scrapeSnapdealProduct,
} from "@/lib/scraper";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 58;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    connectToDB();
    const products = await Product.find({});

    if (!products) throw new Error("Product not found");

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        let scrapedProduct;
        switch (currentProduct.website) {
          case "amazon":
            scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
            break;
          case "ajio":
            scrapedProduct = await scrapeAjioProduct(currentProduct.url);
            break;
          case "purplle":
            scrapedProduct = await scrapePurplleProduct(currentProduct.url);
            break;
          case "snapdeal":
            scrapedProduct = await scrapeSnapdealProduct(currentProduct.url);
            break;
        }

        if (!scrapedProduct) throw new Error("Product not found");
        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product
        );

        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );
        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifType
          );

          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          await sendEmail(emailContent, userEmails);
        }
        return updatedProduct;
      })
    );
    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error) {
    throw new Error(`Error in GET:${error}`);
  }
}
