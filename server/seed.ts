import { storage } from "./storage";

async function main() {
  const [name, pin] = process.argv.slice(2);
  if (!name || !pin) {
    console.error("Usage: npm run seed:admin -- \"Full Name\" <4-5 digit PIN>");
    process.exit(1);
  }
  if (!/^\d{4,5}$/.test(pin)) {
    console.error("PIN must be 4-5 digits");
    process.exit(1);
  }

  const employee = await storage.createEmployee({ name, role: "admin", active: true, pin });
  console.log(`Created admin employee "${employee.name}" (id: ${employee.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
