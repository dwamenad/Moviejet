import { hash } from "bcryptjs";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npm run password:hash -- "your-password"');
    process.exit(1);
  }

  const hashedPassword = await hash(password, 12);
  console.log(hashedPassword);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
