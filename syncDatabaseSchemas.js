const fs = require('fs');
const path = require('path');
const knexFactory = require('knex');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const masterConfig = require('./knexfile');
const slaveConfig = require('./knexfile-slave');

const SCHEMA_TARGETS = [
  {
    name: 'master',
    filePath: path.join(__dirname, 'schema-master.sql'),
    config: masterConfig,
  },
  {
    name: 'slave',
    filePath: path.join(__dirname, 'schema-slave.sql'),
    config: slaveConfig,
  },
];

const ADD_COLUMN_IF_NOT_EXISTS_REGEX = /^ALTER\s+TABLE\s+(`?[\w]+`?)\s+ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\s+(`?[\w]+`?)\s+/i;

const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n');

const splitSqlStatements = (sql) => {
  const cleanedSql = stripSqlComments(sql);
  const statements = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let index = 0; index < cleanedSql.length; index += 1) {
    const char = cleanedSql[index];
    const previousChar = cleanedSql[index - 1];

    if (char === "'" && !inDoubleQuote && !inBacktick && previousChar !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && !inBacktick && previousChar !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      const statement = current.trim();
      if (statement) {
        statements.push(statement);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail) {
    statements.push(tail);
  }

  return statements;
};

const normalizeIdentifier = (identifier) => identifier.replace(/`/g, '');

const executeStatement = async (connection, statement) => {
  const addColumnMatch = statement.match(ADD_COLUMN_IF_NOT_EXISTS_REGEX);

  if (addColumnMatch) {
    const tableName = normalizeIdentifier(addColumnMatch[1]);
    const columnName = normalizeIdentifier(addColumnMatch[2]);
    const hasColumn = await connection.schema.hasColumn(tableName, columnName);

    if (hasColumn) {
      return false;
    }

    const executableStatement = statement.replace(/\s+IF\s+NOT\s+EXISTS/i, '');
    await connection.raw(executableStatement);
    return true;
  }

  await connection.raw(statement);
  return true;
};

const applySchemaFile = async ({ name, filePath, config }) => {
  if (!fs.existsSync(filePath)) {
    console.log(`[schema-sync] ${name}: schema file not found, skipping ${path.basename(filePath)}`);
    return;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const statements = splitSqlStatements(fileContents);

  if (!statements.length) {
    console.log(`[schema-sync] ${name}: no statements found in ${path.basename(filePath)}`);
    return;
  }

  const connection = knexFactory(config);

  try {
    let appliedStatements = 0;

    for (const statement of statements) {
      const executed = await executeStatement(connection, statement);
      if (executed) {
        appliedStatements += 1;
      }
    }

    console.log(`[schema-sync] ${name}: applied ${appliedStatements} statements from ${path.basename(filePath)}`);
  } finally {
    await connection.destroy();
  }
};

const syncDatabaseSchemas = async () => {
  for (const target of SCHEMA_TARGETS) {
    await applySchemaFile(target);
  }
};

module.exports = {
  syncDatabaseSchemas,
};

if (require.main === module) {
  syncDatabaseSchemas().catch((err) => {
    console.error('[schema-sync] failed:', err);
    process.exit(1);
  });
}