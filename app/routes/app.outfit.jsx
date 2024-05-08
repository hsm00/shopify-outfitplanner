import { json } from "@remix-run/node";
import db from "../db.server";
import { apiVersion, authenticate, unauthenticated } from "../shopify.server";

// Function to fetch product details by ID
const getProductById = async (admin, id) => {
  if (!id) return null; // If ID is not provided, return null
  const response = await admin.graphql(`
    query getProductById($id: ID!) {
      product(id: $id) {
        title,
        onlineStorePreviewUrl,
        featuredImage {
          url
        },
      }
    }
  `, { variables: { id } });
  const productJson = await response.json();
  return productJson.data.product;
};

export const loader = async ({ request }) => {
  const shop = "hesams-outfitplanner.myshopify.com";
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  try {
    console.log("customerId", customerId);
    const { admin } = await unauthenticated.admin(shop);

    const outfit = await db.outfit.findUnique({
      where: {
        userId_shop: {
          userId: customerId,
          shop,
        },
      },
    });

    const { name, description, topId, pantsId, shoeId, accessoriesId } = outfit || {};

    // Fetch product details concurrently
    const [top, pants, shoe, accessory] = await Promise.all([
      getProductById(admin, topId),
      getProductById(admin, pantsId),
      getProductById(admin, shoeId),
      getProductById(admin, accessoriesId)
    ]);


    console.log("acce", accessory);
    return json({
      outfitName: name,
      outfitDescription: description,
      topTitle: top?.title,
      topStoreUrl: top?.onlineStorePreviewUrl,
      topImage: top?.featuredImage?.url,
      pantsTitle: pants?.title,
      pantsStoreUrl: pants?.onlineStorePreviewUrl,
      pantsImage: pants?.featuredImage?.url,
      shoeTitle: shoe?.title,
      shoeStoreUrl: shoe?.onlineStorePreviewUrl,
      shoeImage: shoe?.featuredImage?.url,
      accessoryTitle: accessory?.title,
      accessoryStoreUrl: accessory?.onlineStorePreviewUrl,
      accessoryImage: accessory?.featuredImage?.url,
    });
  } catch (err) {
    console.error(err);
    return json({ error: "An error occurred while fetching outfit details." }, 500);
  }
};
