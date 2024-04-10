import {json} from "@remix-run/node";

export const loader = async ({ request }) => {
  console.log('outfit loader');
  return json({ showForm: true });
}
