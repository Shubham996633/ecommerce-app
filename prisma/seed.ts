import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Gaming PC",
      description: "High-performance gaming PC with RTX 3080",
      price: 1500.0,
      image: "/images/gaming-pc.jpg",
    },
    {
      name: "Workstation PC",
      description: "Powerful workstation for professionals",
      price: 2100.0,
      image: "/images/workstation-pc.jpg",
    },
    {
      name: "Gaming Laptop ",
      description: "Powerful gaming laptop beast processor",
      price: 2400.0,
      image: "/images/laptop.jpg",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        description: product.description,
        price: product.price,
        image: product.image,
      },
      create: product,
    });
  }

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
