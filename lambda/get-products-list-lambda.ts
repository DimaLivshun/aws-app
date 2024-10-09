import {productsMock} from "../lib/product-service";
import {wait} from "../shared/helper-functions";
import {APIGatewayProxyResult} from "aws-lambda";

export async function handler(): Promise<APIGatewayProxyResult> {
  try {
    await wait(500)

    return {
      statusCode: 200,
      body: JSON.stringify({ products: productsMock }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve products', error }),
    };
  }
};
