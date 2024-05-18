import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice, extractCurrency, extractDescription } from "../utils";
const username = String(process.env.BRIGHT_DATA_USERNAME);
const password = String(process.env.BRIGHT_PASSWORD);
const port = 22225;
const session_id = (1000000 * Math.random()) | 0;
const options = {
  auth: {
    username: `${username}-session-${session_id}`,
    password,
  },
  host: "brd.superproxy.io",
  port,
  rejectUnauthorized: false,
};

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;
  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_e4260ddd-zone-pricewise:z6txe4z7m35g -k "http://lumtest.com/myip.json"

  try {
    const response = await axios.get(url, options);
    // console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );
    const originalPrice = extractPrice(
      $("#priceblock_outprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#ListPrice"),
      $(".a-size-base.a-color-price")
    );
    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($(".a-price-symbol"));

    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    const description = extractDescription($);

    //Construct data object with scraped information
    const data = {
      url,
      currency: currency || "$",
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: "category",
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      website: "amazon",
      // description: description || "",
    };
    // console.log(data);
    return data;
  } catch (error: any) {
    console.log(`throw error:${error.message}`);
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}

export async function scrapePurplleProduct(url: string) {
  if (!url) return;
  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_e4260ddd-zone-pricewise:z6txe4z7m35g -k "http://lumtest.com/myip.json"

  try {
    const response = await axios.get(url, options);
    // console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $("h6.mb-3.fw-semibold.lh-base").text().trim();
    const currentPrice = extractPrice(
      $("strong.our-price.text-black"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );
    const originalPrice = extractPrice(
      $("del.actual-price.ng-star-inserted"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#ListPrice"),
      $(".a-size-base.a-color-price")
    );
    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";
    const images2 = $("img.w-100.h-100").attr("src") || "{}";
    // console.log("the image is", images2);

    // const imageUrls = Object.keys(JSON.parse(images2));
    const imageUrls = images2;
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = $("span.discount.ng-star-inserted")
      .text()
      .match(/\((\d+)% off\)/);
    // const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    const stars = $("strong.star-rating")
      .text()
      .match(/^(\d+(\.\d+)?)/);
    // console.log("stars", stars);
    const description = extractDescription($);

    //Construct data object with scraped information
    const data = {
      url,
      currency: currency || "\u20B9",
      image: imageUrls,
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: discountRate ? Number(discountRate[1]) : 0,
      category: "category",
      reviewsCount: 100,
      stars: stars ? Number(stars[1]) : 4.5,
      isOutOfStock: outOfStock,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      website: "purplle",
      // description: description || "",
    };
    // console.log(data);
    // return data;

    return data;
  } catch (error: any) {
    console.log(`throw error:${error.message}`);
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}

export async function scrapeAjioProduct(url: string) {
  if (!url) return;
  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_e4260ddd-zone-pricewise:z6txe4z7m35g -k "http://lumtest.com/myip.json"

  try {
    const response = await axios.get(url, options);
    console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $("h1.h2.product-single__title").text().trim();
    // console.log("title", title);
    let currentPrice = extractPrice($("span.product__price"));
    currentPrice = currentPrice.replace(".", "");
    console.log({ currentPrice });
    const originalPrice = extractPrice(
      $("#priceblock_outprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#ListPrice"),
      $(".a-size-base.a-color-price")
    );
    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images =
      $("a.product__thumb").attr("href") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";
    console.log({ images });
    // const imageUrls = Object.keys(JSON.parse(images));
    let images1 = `https:${images}`;

    const currency = extractCurrency($(".a-price-symbol"));

    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    const description = extractDescription($);

    //Construct data object with scraped information
    const data = {
      url,
      currency: currency || "\u20B9",
      image: images1,
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: "category",
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      website: "snitch",
      // description: description || "",
    };
    console.log(data);
    return data;
  } catch (error: any) {
    console.log(`throw error:${error.message}`);
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}
export async function scrapeSnapdealProduct(url: string) {
  if (!url) return;
  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_e4260ddd-zone-pricewise:z6txe4z7m35g -k "http://lumtest.com/myip.json"

  try {
    const response = await axios.get(url, options);
    // console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $("h1.pdp-e-i-head").text().trim();
    console.log({ title });
    const currentPrice = extractPrice($("span.payBlkBig"));
    // let originalPrice = extractPrice(
    //   $("#priceblock_outprice"),
    //   $(".a-price.a-text-price span.a-offscreen"),
    //   $("#ListPrice"),
    //   $(".a-size-base.a-color-price")
    // );
    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";

    const images = $("img.cloudzoom").attr("src") || "{}";

    // const imageUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = $("span.pdpDiscount").text().match(/\d+/);
    const originalPrice =
      Number(discountRate) != 0
        ? (Number(currentPrice) * 100) / Number(discountRate)
        : Number(currentPrice);
    console.log({ discountRate });

    // const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    const description = extractDescription($);

    //Construct data object with scraped information
    const data = {
      url,
      currency: currency || "$",
      image: images,
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: discountRate ? Number(discountRate[0]) : 0,
      category: "category",
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      website: "snapdeal",
      // description: description || "",
    };
    console.log(data);
    return data;
  } catch (error: any) {
    console.log(`throw error:${error.message}`);
    throw new Error(`Failed to scrape product:${error.message}`);
  }
}
