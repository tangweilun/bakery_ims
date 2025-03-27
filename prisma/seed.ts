import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.supplier.createMany({
    data: [
      {
        name: "Fresh Dairy Supplies",
        contactPerson: "Alice Johnson",
        email: "alice@freshdairy.com",
        phone: "+123456789",
        address: "123 Milk Street, Dairyland",
        notes: "Specializes in dairy products like milk and butter.",
      },
      {
        name: "Golden Grains Wholesale",
        contactPerson: "Bob Smith",
        email: "bob@goldengrains.com",
        phone: "+987654321",
        address: "456 Wheat Avenue, Breadsville",
        notes: "Provides premium-quality flour and grains.",
      },
      {
        name: "Spice King Imports",
        contactPerson: "Charlie Brown",
        email: "charlie@spiceking.com",
        phone: "+1122334455",
        address: "789 Spice Road, Flavor Town",
        notes: "Supplier of exotic spices and herbs.",
      },
      {
        name: "Sweet Sugar Co.",
        contactPerson: "Diana White",
        email: "diana@sweetsugar.com",
        phone: "+9988776655",
        address: "321 Candy Lane, Sweet City",
        notes: "Delivers sugar, chocolate, and syrups.",
      },
      {
        name: "Organic Farm Fresh",
        contactPerson: "Ethan Green",
        email: "ethan@organicfarm.com",
        phone: "+6677889900",
        address: "555 Greenfield, EcoTown",
        notes: "Sells organic eggs, dairy, and fresh produce.",
      },
    ],
  });

  // Fetch supplier IDs
  const supplierMap = await prisma.supplier.findMany();
  const suppliersByName: Record<string, number> = {};
  supplierMap.forEach((supplier) => {
    suppliersByName[supplier.name] = supplier.id;
  });

  // Seed ingredients and relate them to suppliers
  await prisma.ingredient.createMany({
    data: [
      {
        name: "Whole Milk",
        description: "Fresh whole milk from dairy farms",
        category: "Dairy",
        unit: "liters",
        currentStock: 0,
        minimumStock: 10,
        idealStock: 100,
        cost: 1.5,
        supplierId: suppliersByName["Fresh Dairy Supplies"],
      },
      {
        name: "Flour",
        description: "All-purpose baking flour",
        category: "Dry Goods",
        unit: "kg",
        currentStock: 0,
        minimumStock: 20,
        idealStock: 200,
        cost: 2.0,
        supplierId: suppliersByName["Golden Grains Wholesale"],
      },
      {
        name: "Cinnamon Powder",
        description: "High-quality cinnamon spice",
        category: "Spices",
        unit: "kg",
        currentStock: 0,
        minimumStock: 2,
        idealStock: 20,
        cost: 5.0,
        supplierId: suppliersByName["Spice King Imports"],
      },
      {
        name: "Granulated Sugar",
        description: "Fine white sugar for baking",
        category: "Sweeteners",
        unit: "kg",
        currentStock: 0,
        minimumStock: 15,
        idealStock: 150,
        cost: 1.8,
        supplierId: suppliersByName["Sweet Sugar Co."],
      },
      {
        name: "Organic Eggs",
        description: "Farm-fresh organic eggs",
        category: "Dairy",
        unit: "pieces",
        currentStock: 0,
        minimumStock: 50,
        idealStock: 300,
        cost: 0.3,
        supplierId: suppliersByName["Organic Farm Fresh"],
      },
    ],
  });

  console.log("✅ Supplier seed data inserted successfully!");

  const ingredients = await prisma.ingredient.findMany();
  const ingredientMap: Record<string, number> = {};
  ingredients.forEach((ing) => {
    ingredientMap[ing.name.toLowerCase()] = ing.id;
  });

  // Create recipes with their ingredients
  const recipesData = [
    {
      name: "Plain Bread",
      description: "Classic white bread",
      category: "Bread",
      preparationTime: 60,
      bakingTime: 30,
      yieldQuantity: 2,
      instructions: "Mix flour, yeast, salt. Knead, let rise, shape, and bake.",
      sellingPrice: 3.5,
      ingredients: [
        { name: "flour", quantity: 0.5 },
        { name: "whole milk", quantity: 0.2 },
        { name: "organic eggs", quantity: 2 },
      ],
    },
    {
      name: "Jam Croissant",
      description: "Buttery croissant filled with fruit jam",
      category: "Pastry",
      preparationTime: 120,
      bakingTime: 20,
      yieldQuantity: 6,
      instructions:
        "Prepare laminated dough, fill with jam, shape, and bake until golden.",
      sellingPrice: 4.0,
      ingredients: [
        { name: "flour", quantity: 0.3 },
        { name: "organic eggs", quantity: 1 },
        { name: "granulated sugar", quantity: 0.1 },
      ],
    },
    {
      name: "Americano",
      description: "Classic black coffee",
      category: "Beverage",
      preparationTime: 5,
      yieldQuantity: 1,
      instructions: "Brew espresso and add hot water.",
      sellingPrice: 3.0,
      ingredients: [],
    },
    {
      name: "Caffe Latte",
      description: "Espresso with steamed milk",
      category: "Beverage",
      preparationTime: 10,
      yieldQuantity: 1,
      instructions: "Pull espresso shot and steam milk, combine.",
      sellingPrice: 4.5,
      ingredients: [{ name: "whole milk", quantity: 0.2 }],
    },
    {
      name: "Tiramisu",
      description: "Classic Italian coffee-flavored dessert",
      category: "Dessert",
      preparationTime: 30,
      yieldQuantity: 6,
      instructions: "Layer mascarpone, coffee-soaked ladyfingers, and cocoa.",
      sellingPrice: 6.0,
      ingredients: [
        { name: "whole milk", quantity: 0.3 },
        { name: "organic eggs", quantity: 3 },
        { name: "granulated sugar", quantity: 0.2 },
      ],
    },
    {
      name: "Pain au Chocolat",
      description: "Chocolate-filled croissant",
      category: "Pastry",
      preparationTime: 120,
      bakingTime: 20,
      yieldQuantity: 6,
      instructions:
        "Prepare laminated dough, add chocolate bar, shape, and bake.",
      sellingPrice: 4.5,
      ingredients: [
        { name: "flour", quantity: 0.3 },
        { name: "organic eggs", quantity: 1 },
        { name: "granulated sugar", quantity: 0.1 },
      ],
    },
    {
      name: "Cacao Deep",
      description: "Rich chocolate dessert",
      category: "Dessert",
      preparationTime: 45,
      bakingTime: 30,
      yieldQuantity: 4,
      instructions: "Mix chocolate, cream, eggs. Bake in water bath.",
      sellingPrice: 5.5,
      ingredients: [
        { name: "whole milk", quantity: 0.2 },
        { name: "organic eggs", quantity: 2 },
        { name: "granulated sugar", quantity: 0.1 },
      ],
    },
    {
      name: "Almond Croissant",
      description: "Buttery croissant with almond cream",
      category: "Pastry",
      preparationTime: 120,
      bakingTime: 20,
      yieldQuantity: 6,
      instructions:
        "Prepare laminated dough, fill with almond cream, shape, and bake.",
      sellingPrice: 4.75,
      ingredients: [
        { name: "flour", quantity: 0.3 },
        { name: "organic eggs", quantity: 1 },
        { name: "granulated sugar", quantity: 0.1 },
      ],
    },
    {
      name: "Croque Monsieur",
      description: "Classic French ham and cheese sandwich",
      category: "Sandwich",
      preparationTime: 15,
      bakingTime: 10,
      yieldQuantity: 2,
      instructions:
        "Layer ham and cheese between bread, butter outside, grill until golden.",
      sellingPrice: 5.0,
      ingredients: [
        { name: "flour", quantity: 0.1 },
        { name: "whole milk", quantity: 0.1 },
        { name: "organic eggs", quantity: 1 },
      ],
    },
    {
      name: "Milk Tea",
      description: "Traditional milk tea",
      category: "Beverage",
      preparationTime: 10,
      yieldQuantity: 1,
      instructions: "Brew tea, add milk and sugar.",
      sellingPrice: 3.5,
      ingredients: [
        { name: "whole milk", quantity: 0.2 },
        { name: "granulated sugar", quantity: 0.05 },
      ],
    },
    {
      name: "Chocolate Gateau",
      description: "Rich chocolate cake",
      category: "Cake",
      preparationTime: 45,
      bakingTime: 35,
      yieldQuantity: 8,
      instructions: "Mix chocolate, flour, eggs. Bake and decorate.",
      sellingPrice: 6.5,
      ingredients: [
        { name: "flour", quantity: 0.4 },
        { name: "organic eggs", quantity: 3 },
        { name: "whole milk", quantity: 0.2 },
        { name: "granulated sugar", quantity: 0.3 },
      ],
    },
    {
      name: "Cheese Cake",
      description: "Classic creamy cheesecake",
      category: "Cake",
      preparationTime: 30,
      bakingTime: 50,
      yieldQuantity: 8,
      instructions:
        "Mix cream cheese, eggs, sugar. Bake in graham cracker crust.",
      sellingPrice: 5.75,
      ingredients: [
        { name: "whole milk", quantity: 0.2 },
        { name: "organic eggs", quantity: 3 },
        { name: "granulated sugar", quantity: 0.2 },
      ],
    },
    {
      name: "Lemon Ade",
      description: "Refreshing lemonade",
      category: "Beverage",
      preparationTime: 10,
      yieldQuantity: 1,
      instructions: "Mix lemon juice, water, and sugar.",
      sellingPrice: 3.0,
      ingredients: [{ name: "granulated sugar", quantity: 0.1 }],
    },
  ];

  // Create recipes and their ingredients
  for (const recipeData of recipesData) {
    const recipe = await prisma.recipe.create({
      data: {
        name: recipeData.name,
        description: recipeData.description,
        category: recipeData.category,
        preparationTime: recipeData.preparationTime,
        bakingTime: recipeData.bakingTime,
        yieldQuantity: recipeData.yieldQuantity,
        instructions: recipeData.instructions,
        sellingPrice: recipeData.sellingPrice,
      },
    });

    // Create recipe ingredients
    for (const ing of recipeData.ingredients) {
      const ingredientId = ingredientMap[ing.name];
      if (ingredientId) {
        await prisma.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            ingredientId: ingredientId,
            quantity: ing.quantity,
          },
        });
      }
    }
  }

  console.log("✅ Recipes and their ingredients inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding supplier data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
