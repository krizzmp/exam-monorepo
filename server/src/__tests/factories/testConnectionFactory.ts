import { createConnection, getConnection } from "typeorm";
import * as entities from "../../entities";

export async function createTestConnection() {
  let con = await createConnection({
    type: "postgres",
    url: "postgresql://localhost:5432/exam_test",
    entities: Object.values(entities),
    logging: false
  });
  console.log("con createed");
  await con.dropDatabase();
  console.log("con dropped");
  await con.synchronize();
  console.log("con synchronized");
}

export async function closeTestConnection() {
  let conn = getConnection();
  if (conn.isConnected) {
    await conn.dropDatabase();
    await conn.close();
    console.log("con closed");
  } else {
    console.log("con already closed");
  }
}
