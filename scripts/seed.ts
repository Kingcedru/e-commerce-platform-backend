import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import bcrypt from "bcrypt";
import { UserRole } from "@/enums/role";
import { connectDB } from "@/config/database";
import { User } from "@/models/user.model";

const createAdmin = async () => {
  await connectDB();

  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Please define ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env file"
    );
    process.exit(1);
  }

  const existingAdmin = await User.findOne({
    where: { email: ADMIN_EMAIL },
  });

  if (!existingAdmin) {
    console.log("Creating initial Admin user...");
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: UserRole.Admin,
    });
    console.log("Admin user created successfully.");
  } else {
    console.log("Admin user already exists. Skipping creation.");
  }

  process.exit();
};

createAdmin().catch((err) => {
  console.error("Admin creation failed:", err);
  process.exit(1);
});
