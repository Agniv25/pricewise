"use client";
import { scrapeAndStoreProduct } from "@/lib/actions";
import Image from "next/image";
import React, { FormEvent, useState } from "react";

const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;
    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon") ||
      hostname.includes("flipkart")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};
const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeType, setScrapeType] = useState("amazon");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    var isValidLink = isValidAmazonProductURL(searchPrompt);
    isValidLink = true;

    // alert(isValidLink ? "Valid link" : "Invalid link");
    if (!isValidLink) return alert("Please enter a valid Amazon link");

    try {
      setIsLoading(true);

      //Scrape the product page
      const product = await scrapeAndStoreProduct(searchPrompt, scrapeType);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h3 className="text-[20px] text-secondary font-semibold mt-4">
        Select Which Website Product You want to track
      </h3>
      <div className="flex gap-2">
        <Image
          className={`cursor-pointer ${
            scrapeType === "amazon" ? "opacity-50" : ""
          }`}
          src="/assets/images/amazon.png"
          alt="amazon"
          width={80}
          height={80}
          onClick={() => setScrapeType("amazon")}
        />
        <Image
          className={`cursor-pointer ${
            scrapeType === "purplle" ? "opacity-50" : ""
          }`}
          src="/assets/images/purplle.png"
          alt="purplle"
          width={80}
          height={80}
          onClick={() => setScrapeType("purplle")}
        />
        <Image
          className={`cursor-pointer ${
            scrapeType === "ajio" ? "opacity-50" : ""
          }`}
          src="/assets/images/snitch.png"
          alt="snitch"
          width={80}
          height={80}
          onClick={() => setScrapeType("ajio")}
        />
        <Image
          className={`cursor-pointer ${
            scrapeType === "snapdeal" ? "opacity-50" : ""
          }`}
          src="/assets/images/snapdeal.png"
          alt="snapdeal"
          width={80}
          height={80}
          onClick={() => setScrapeType("snapdeal")}
        />
      </div>
      <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          placeholder="Enter product link"
          className="searchbar-input"
        />

        <button
          type="submit"
          className="searchbar-btn"
          disabled={searchPrompt === ""}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>
    </>
  );
};

export default Searchbar;
