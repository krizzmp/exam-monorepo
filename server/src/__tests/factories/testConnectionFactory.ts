import {createConnection, getConnection} from "typeorm";
import * as entities from "../../entities";

export function createTestConnection() {
  return createConnection({
    type: "postgres",
    url: "postgresql://localhost:5432/exam_test",
    dropSchema: true,
    entities: Object.values(entities),
    synchronize: true,
    logging: false,
  });
}

export function closeTestConnection() {
  let conn = getConnection();
  return conn.close();
}