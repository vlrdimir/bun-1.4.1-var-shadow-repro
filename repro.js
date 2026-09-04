import { t } from "elysia";
const schema = t.Object({ name: t.String() });
console.log("bundle parsed and ran, schema:", typeof schema);
