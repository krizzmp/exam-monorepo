import {createConnection, getConnection} from "typeorm";
import * as entities from "../../entities";

export async function createTestConnection() {
  await createConnection({
    type: "postgres",
    url: "postgresql://localhost:5432/exam_test",
    entities: Object.values(entities),
    logging: false,
  });
  console.log("con createed");
  await getConnection().synchronize(true);
  console.log("con synchronized");

}

export async function closeTestConnection() {
  let conn = getConnection();
  await conn.close();
  console.log("con closed");
}