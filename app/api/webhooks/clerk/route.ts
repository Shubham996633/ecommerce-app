import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const payload = await req.json();
  const headersList = headers();

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook secret not set", { status: 500 });
  }

  const svix_id = (await headersList).get("svix-id");
  const svix_timestamp = (await headersList).get("svix-timestamp");
  const svix_signature = (await headersList).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0].email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    await prisma.user.upsert({
      where: { id },
      update: { email, name },
      create: { id, email, name },
    });
  }

  return new Response("Success", { status: 200 });
}
