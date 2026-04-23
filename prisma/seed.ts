import { PrismaClient, UserRole, IssueSeverity, IssuePriority } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Create SUPER_ADMIN user ─────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("ChangeMe123!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@llc.local" },
    update: {},
    create: {
      email: "superadmin@llc.local",
      password: hashedPassword,
      name: "Super Administrator",
      role: UserRole.SUPER_ADMIN,
      avatar: null,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      mustChangePassword: false,
    },
  });
  console.log(`✅ Created super admin: ${superAdmin.email}`);

  // ─── Default Issue Categories ─────────────────────────────────────────────────
  const categories = ["UI", "Logic", "Performance", "Security", "Data"];

  for (const category of categories) {
    await prisma.systemSetting.upsert({
      where: { key: `category:${category}` },
      update: {},
      create: { key: `category:${category}`, value: category },
    });
  }
  console.log(`✅ Created ${categories.length} default categories`);

  // ─── Default Modules ────────────────────────────────────────────────────────
  const modules = ["POS", "Inventory", "Billing", "Reports", "Transport", "Settings"];

  for (const module of modules) {
    await prisma.systemSetting.upsert({
      where: { key: `module:${module}` },
      update: {},
      create: { key: `module:${module}`, value: module },
    });
  }
  console.log(`✅ Created ${modules.length} default modules`);

  // ─── Default Tags ────────────────────────────────────────────────────────────
  const tags = [
    { name: "bug", color: "#ef4444" },
    { name: "feature", color: "#22c55e" },
    { name: "urgent", color: "#f97316" },
    { name: "backend", color: "#3b82f6" },
    { name: "frontend", color: "#a855f7" },
  ];

  for (const tag of tags) {
    await prisma.issueTag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
        color: tag.color,
      },
    });
  }
  console.log(`✅ Created ${tags.length} default tags`);

  // ─── Default Notification Preferences ────────────────────────────────────────
  const eventTypes = [
    "issue_created",
    "issue_assigned",
    "issue_status_changed",
    "issue_comment_added",
    "poll_created",
    "poll_ended",
    "message_received",
    "mention",
  ];

  for (const eventType of eventTypes) {
    await prisma.notificationPreference.upsert({
      where: {
        userId_eventType: {
          userId: superAdmin.id,
          eventType,
        },
      },
      update: {},
      create: {
        userId: superAdmin.id,
        eventType,
        enabled: true,
      },
    });
  }
  console.log(`✅ Created ${eventTypes.length} notification preferences for super admin`);

  // ─── Default System Settings ─────────────────────────────────────────────────
  const systemSettings = [
    { key: "platform_name", value: "LLC-ITP" },
    { key: "platform_version", value: "1.0.0" },
    { key: "max_upload_size_mb", value: "10" },
    { key: "session_timeout_minutes", value: "60" },
    { key: "password_min_length", value: "8" },
    { key: "allow_registration", value: "false" },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ Created ${systemSettings.length} system settings`);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Default credentials:");
  console.log("   Email:    superadmin@llc.local");
  console.log("   Password: ChangeMe123!");
  console.log("\n⚠️  Remember to change the password after first login!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
