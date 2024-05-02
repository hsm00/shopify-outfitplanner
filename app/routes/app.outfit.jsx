import { json } from "@remix-run/node";
import db from "../db.server";
import { apiVersion, authenticate } from "../shopify.server";


export const query =`
{
    products(first: 10) {
      edges{
        node{
          title
        }
      }
    }
}
`
export const loader = async ({ request }) => {
  const shop = "hesams-outfitplanner.myshopify.com";

  try{
    const response = await fetch(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/graphql",
        "X-Shopify-Access-Token": request.headers.get("X-Shopify-Access-Token"),
  },
    body: query

  });

    if(response.ok){
      const data = await response.json()

      const {
        data: {
          products: { edges }
        }
      } = data;
      console.log(edges)
      return edges
    }

    return null

  } catch(err){
    console.log(err)
  }

}
