import database from "@/infra/database.js";
import { InternalServerError } from "infra/errors";

async function status() {
  try {
    const updatedAt = new Date().toISOString();
    const database_status = await database.status();
    return Response.json(
      {
        updated_at: updatedAt,
        database: database_status,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\nController error:");
    console.error(publicErrorObject);

    return Response.json(publicErrorObject, {
      status: publicErrorObject.statusCode || 500,
    });
  }
}

export const GET = status;
