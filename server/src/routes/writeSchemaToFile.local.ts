import fs from 'fs';
import { schema } from './graphql/schema.js';
import { printSchema } from 'graphql';

const schemaString = printSchema(schema);

fs.writeFile('./schema.graphql', schemaString, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Schema written to file');
});
