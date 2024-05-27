import { json } from "@remix-run/node";
import db from "../db.server";
import { apiVersion, authenticate, unauthenticated } from "../shopify.server";

export const action = async ({ request }) => {
  const shop = process.env.SHOP_URL
  const requestData = await request.json();
  const customerId = requestData.customerId;
  const productId = requestData.productId;
  const productType = requestData.productType;

  console.log("productType", productType);
  console.log("productId", productId);

  try {
    const { admin } = await unauthenticated.admin(shop);

    let outfit = await db.outfit.findUnique({
      where: {
        userId_shop: {
          userId: customerId,
          shop,
        },
      },
    });

    if (!outfit) {
      // Create a new outfit if it doesn't exist
      outfit = await db.outfit.create({
        data: {
          userId: customerId,
          shop,
        },
      });
    }

    // Update the outfit with the new product
    switch (productType) {
      case "top":
        outfit = await db.outfit.update({
          where: {
            id: outfit.id,
          },
          data: {
            topId: productId,
          },
        });
        break;
      case "pant":
        outfit = await db.outfit.update({
          where: {
            id: outfit.id,
          },
          data: {
            pantsId: productId,
          },
        });
        break;
      case "shoe":
        console.log("shoe");
        outfit = await db.outfit.update({
          where: {
            id: outfit.id,
          },
          data: {
            shoesId: productId,
          },
        });
        break;
      case "accessory":
        outfit = await db.outfit.update({
          where: {
            id: outfit.id,
          },
          data: {
            accessoriesId: productId,
          },
        });
        break;
        case "hat":
        outfit = await db.outfit.update({
          where: {
            id: outfit.id,
          },
          data: {
            hatId: productId,
          },
        });
      default:
        return json({ error: "Invalid product type" }, 400);
    }

    return json({ message: "Product added to outfit successfully" });
  } catch (error) {
    console.log(error);
    return json({ error: "An error occurred while adding the product to the outfit." }, 500);
  }
};
