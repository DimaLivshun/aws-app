import {wait} from "../shared/helper-functions";
import {productsMock} from "../lib/product-service";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent) {
  try {
    await wait(500)

    const id = event.pathParameters?.id

    if (!id) return {
      statusCode: 400,
      body: JSON.stringify({ message: 'id was not provided' }),
    };

    const product = productsMock.find(product => product.id === id);

    if (!product) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Product with id:${id} was not found` }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to retrieve products', error }),
    };
  }
};
