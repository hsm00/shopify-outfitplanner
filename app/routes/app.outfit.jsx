import { json } from "@remix-run/node";
import db from "../db.server";
import { apiVersion, authenticate } from "../shopify.server";

const variables = { id: "gid://shopify/Product/7676293513374" }; // Pass your product ID here

export const query = `
query { product(id: "${variables.id}") { title } }
`;

export const loader = async ({ request }) => {
  const shop = "hesams-outfitplanner.myshopify.com";
  console.log("test")
  try{
    const response = await fetch(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/graphql",
        "X-Shopify-Access-Token": request.headers.get("X-Shopify-Access-Token"),
  },
      body: query,
  });

    if(response.ok){
      const data = await response.json()


      console.log(data)
      return data
    }

    return null

  } catch(err){
    console.log(err)
  }

}
