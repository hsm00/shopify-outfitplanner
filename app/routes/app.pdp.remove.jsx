import { json } from "@remix-run/node";
import db from "../db.server";
import { unauthenticated } from "../shopify.server";

export const action = async ({ request }) => {
  const shop = "hesams-outfitplanner.myshopify.com";
  const requestData = await request.json();
  const customerId = requestData.customerId;
  const productId = requestData.productId

  try {
    const { admin } = await unauthenticated.admin(shop);

    const outfit = await db.outfit.findUnique({
      where: {
        userId_shop: {
          userId: customerId,
          shop,
        },
      },
    });

    // Set the product IDs from the retrieved outfit
    const { topId, pantsId, shoesId, accessoriesId, hatId } = outfit || {};

    // Compare the productId with the outfit's product IDs
    const updatedTopId = productId === topId ? null : topId;
    const updatedPantsId = productId === pantsId ? null : pantsId;
    const updatedShoeId = productId === shoesId ? null : shoesId;
    const updatedAccessoriesId = productId === accessoriesId ? null : accessoriesId;
    const updatedHatId = productId === hatId ? null : hatId;
    // Update the outfit record with the new product IDs
    const updatedOutfit = await db.outfit.updateMany({
      where: {
        AND: {
          userId: customerId,
          shop,
        },
      },
      data: {
        topId: updatedTopId,
        pantsId: updatedPantsId,
        shoesId: updatedShoeId,
        accessoriesId: updatedAccessoriesId,
        hatId: updatedHatId,
      },
    });
    return json({ message: "Product removed from outfit successfully" });
  } catch (error) {
    console.log(error);
    return json({ error: "An error occurred while removing the product from the outfit." }, 500);
  }
};
