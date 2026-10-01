import { mkdirSync, writeFileSync } from "node:fs";

const BASE_URL = "https://jsonplaceholder.typicode.com";
const OUTPUT_DIR = "output";

async function fetchEndpoint(endpoint: string): Promise<unknown> {
  const response = await fetch(`${BASE_URL}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`La API respondio ${response.status} para ${endpoint}`);
  }

  return response.json();
}

function saveJson(data: unknown, fileName: string): string {
  const filePath = `${OUTPUT_DIR}/${fileName}`;

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

  return filePath;
}

function getArg(name: string): string | undefined {
   
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main(): Promise<void> {
  const endpoint = getArg("endpoint");

  if (!endpoint) {
    console.log('Uso: node dist/main.js fetch --endpoint <posts|users|comments|todos>');
    return;
  }

  console.log(`Consultando ${endpoint}...`);
  const data = await fetchEndpoint(endpoint);
  const filePath = saveJson(data, `${endpoint}.json`);
  console.log(`Listo. Guardado en ${filePath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
