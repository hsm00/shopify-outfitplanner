import { json } from "@remix-run/node";
import db from "../db.server";
import { apiVersion, authenticate, unauthenticated } from "../shopify.server";

// Function to fetch product details by ID
const getProductById = async (admin, id) => {
  if (!id) return null; // If ID is not provided, return null
  console.log(`Fetching product with ID: ${id}`);
  const response = await admin.graphql(`
    query getProductById($id: ID!) {
      product(id: $id) {
        id,
        title,
        onlineStorePreviewUrl,
        featuredImage {
          url
        },
      }
    }
  `, { variables: { id: `gid://shopify/Product/${id}` } });
  const productJson = await response.json();
  console.log("Product details fetched successfully" ,productJson.data.product)
  return productJson.data.product;
};

export const loader = async ({ request }) => {
  const shop = process.env.SHOP_URL
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
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

    const { name, description, topId, pantsId, shoesId, accessoriesId, hatId } = outfit || {};

    // Fetch product details concurrently
    const [top, pants, shoe, accessory, hat] = await Promise.all([
      getProductById(admin, topId),
      getProductById(admin, pantsId),
      getProductById(admin, shoesId),
      getProductById(admin, accessoriesId),
      getProductById(admin, hatId)
    ])

    return json({
      outfitName: name,
      outfitDescription: description,
      topId: topId,
      topTitle: top?.title,
      topStoreUrl: top?.onlineStorePreviewUrl,
      topImage: top?.featuredImage?.url,
      pantsId: pantsId,
      pantsTitle: pants?.title,
      pantsStoreUrl: pants?.onlineStorePreviewUrl,
      pantsImage: pants?.featuredImage?.url,
      shoeId: shoesId,
      shoeTitle: shoe?.title,
      shoeStoreUrl: shoe?.onlineStorePreviewUrl,
      shoeImage: shoe?.featuredImage?.url,
      accessoryId: accessoriesId,
      accessoryTitle: accessory?.title,
      accessoryStoreUrl: accessory?.onlineStorePreviewUrl,
      accessoryImage: accessory?.featuredImage?.url,
      hatId: hatId,
      hatTitle: hat?.title,
      hatStoreUrl: hat?.onlineStorePreviewUrl,
      hatImage: hat?.featuredImage?.url,
    });
  } catch (err) {
    console.error(err);
    return json({ error: "An error occurred while fetching outfit details." }, 500);
  }
};

export const action = async ({ request }) => {
  const shop = process.env.SHOP_URL
  const requestData = await request.json();
  const customerId = requestData.customerId;
  const newName = requestData.newName;
  const newDescription = requestData.newDescription;

  try {
    const outfit = await db.outfit.updateMany({
      where: {
        AND: {
          userId: customerId,
          shop,
        },
      },
      data: {
        name: newName,
        description: newDescription,
      },
    });
    return json({ message: "Outfit updated successfully" });
  } catch (err) {
    console.error(err);
    return json({ error: "An error occurred while updating the outfit." }, 500);
  }
};
