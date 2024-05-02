import { json } from "@remix-run/node";
import db from "../db.server";
import {authenticate, unauthenticated} from "../shopify.server.js";

export const loader = async ({ request }) => {
  const customerId = "7539008241822";
  const shop = "hesams-outfitplanner.myshopify.com";
  const pantsName = "Levis Jeans"
  const pantsImageUrl = "https://cdn.shopify.com/s/files/1/0645/0328/3870/products/snowboard_wax.png?v=1708976930&width=713"
  const topName = "T-shirt"
  const topImageUrl = "https://cdn.shopify.com/s/files/1/0645/0328/3870/products/snowboard_wax.png?v=1708976930&width=713"
  const shoesName = "Sneakers"
  const shoesImageUrl = "https://cdn.shopify.com/s/files/1/0645/0328/3870/products/snowboard_wax.png?v=1708976930&width=713"
  const accessoriesName = "Watch"
  const accessoriesImageUrl = "https://cdn.shopify.com/s/files/1/0645/0328/3870/products/snowboard_wax.png?v=1708976930&width=713"

  console.log("REQUEST", request);
  const { admin } = await authenticate.admin(request);

  console.log(admin);

  const outfit = await db.outfit.findMany(
    {
      where: {
        userId: customerId,
        shop: shop,
      },
    }
  )

  const response = await admin.graphql(
    `#graphql
  query getProductById($id: ID!) {
    product(id: $id) {
      title
    }
  }`,
    {
      variables: {
        id: "gid://shopify/Product/7676292956318"
      }
    }
  );

    console.log(response);

  const userId = outfit[0].userId;
  const shopUrl = outfit[0].shop;
  const pantsId = outfit[0].accessoriesId;


  if(outfit.length === 0) {
    return json({
      name: "No outfit found",
    });
  }
  return json({
    name: outfit[0].name,
    description: outfit[0].description,
    pants_name: pantsName,
    pants_image_url: pantsImageUrl,
    top_name: topName,
    top_image_url: topImageUrl,
    shoes_name: shoesName,
    shoes_image_url: shoesImageUrl,
    accessories_name: accessoriesName,
    accessories_image_url: accessoriesImageUrl,
  });
};
