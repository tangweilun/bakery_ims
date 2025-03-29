// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   await prisma.supplier.createMany({
//     data: [
//       {
//         name: "Fresh Dairy Supplies",
//         contactPerson: "Alice Johnson",
//         email: "alice@freshdairy.com",
//         phone: "+123456789",
//         address: "123 Milk Street, Dairyland",
//         notes: "Specializes in dairy products like milk and butter.",
//       },
//       {
//         name: "Golden Grains Wholesale",
//         contactPerson: "Bob Smith",
//         email: "bob@goldengrains.com",
//         phone: "+987654321",
//         address: "456 Wheat Avenue, Breadsville",
//         notes: "Provides premium-quality flour and grains.",
//       },
//       {
//         name: "Spice King Imports",
//         contactPerson: "Charlie Brown",
//         email: "charlie@spiceking.com",
//         phone: "+1122334455",
//         address: "789 Spice Road, Flavor Town",
//         notes: "Supplier of exotic spices and herbs.",
//       },
//       {
//         name: "Sweet Sugar Co.",
//         contactPerson: "Diana White",
//         email: "diana@sweetsugar.com",
//         phone: "+9988776655",
//         address: "321 Candy Lane, Sweet City",
//         notes: "Delivers sugar, chocolate, and syrups.",
//       },
//       {
//         name: "Organic Farm Fresh",
//         contactPerson: "Ethan Green",
//         email: "ethan@organicfarm.com",
//         phone: "+6677889900",
//         address: "555 Greenfield, EcoTown",
//         notes: "Sells organic eggs, dairy, and fresh produce.",
//       },
//     ],
//   });

//   // Fetch supplier IDs
//   const supplierMap = await prisma.supplier.findMany();
//   const suppliersByName: Record<string, number> = {};
//   supplierMap.forEach((supplier) => {
//     suppliersByName[supplier.name] = supplier.id;
//   });

//   // Seed ingredients and relate them to suppliers
//   await prisma.ingredient.createMany({
//     data: [
//       {
//         name: "Whole Milk",
//         description: "Fresh whole milk from dairy farms",
//         category: "Dairy",
//         unit: "liters",
//         currentStock: 0,
//         minimumStock: 10,
//         idealStock: 100,
//         cost: 1.5,
//         supplierId: suppliersByName["Fresh Dairy Supplies"],
//       },
//       {
//         name: "Flour",
//         description: "All-purpose baking flour",
//         category: "Dry Goods",
//         unit: "kg",
//         currentStock: 0,
//         minimumStock: 20,
//         idealStock: 200,
//         cost: 2.0,
//         supplierId: suppliersByName["Golden Grains Wholesale"],
//       },
//       {
//         name: "Cinnamon Powder",
//         description: "High-quality cinnamon spice",
//         category: "Spices",
//         unit: "kg",
//         currentStock: 0,
//         minimumStock: 2,
//         idealStock: 20,
//         cost: 5.0,
//         supplierId: suppliersByName["Spice King Imports"],
//       },
//       {
//         name: "Granulated Sugar",
//         description: "Fine white sugar for baking",
//         category: "Sweeteners",
//         unit: "kg",
//         currentStock: 0,
//         minimumStock: 15,
//         idealStock: 150,
//         cost: 1.8,
//         supplierId: suppliersByName["Sweet Sugar Co."],
//       },
//       {
//         name: "Organic Eggs",
//         description: "Farm-fresh organic eggs",
//         category: "Dairy",
//         unit: "pieces",
//         currentStock: 0,
//         minimumStock: 50,
//         idealStock: 300,
//         cost: 0.3,
//         supplierId: suppliersByName["Organic Farm Fresh"],
//       },
//     ],
//     skipDuplicates: true,
//   });

//   console.log("✅ Supplier seed data inserted successfully!");

//   const ingredients = await prisma.ingredient.findMany();
//   const ingredientMap: Record<string, number> = {};
//   ingredients.forEach((ing) => {
//     ingredientMap[ing.name.toLowerCase()] = ing.id;
//   });

//   // Create recipes with their ingredients
//   const recipesData = [
//     {
//       name: "Plain Bread",
//       description: "Classic white bread",
//       category: "Bread",
//       preparationTime: 60,
//       bakingTime: 30,
//       yieldQuantity: 2,
//       instructions: "Mix flour, yeast, salt. Knead, let rise, shape, and bake.",
//       sellingPrice: 3.5,
//       ingredients: [
//         { name: "flour", quantity: 0.5 },
//         { name: "whole milk", quantity: 0.2 },
//         { name: "organic eggs", quantity: 2 },
//       ],
//     },
//     {
//       name: "Jam Croissant",
//       description: "Buttery croissant filled with fruit jam",
//       category: "Pastry",
//       preparationTime: 120,
//       bakingTime: 20,
//       yieldQuantity: 6,
//       instructions:
//         "Prepare laminated dough, fill with jam, shape, and bake until golden.",
//       sellingPrice: 4.0,
//       ingredients: [
//         { name: "flour", quantity: 0.3 },
//         { name: "organic eggs", quantity: 1 },
//         { name: "granulated sugar", quantity: 0.1 },
//       ],
//     },
//     {
//       name: "Americano",
//       description: "Classic black coffee",
//       category: "Beverage",
//       preparationTime: 5,
//       yieldQuantity: 1,
//       instructions: "Brew espresso and add hot water.",
//       sellingPrice: 3.0,
//       ingredients: [],
//     },
//     {
//       name: "Caffe Latte",
//       description: "Espresso with steamed milk",
//       category: "Beverage",
//       preparationTime: 10,
//       yieldQuantity: 1,
//       instructions: "Pull espresso shot and steam milk, combine.",
//       sellingPrice: 4.5,
//       ingredients: [{ name: "whole milk", quantity: 0.2 }],
//     },
//     {
//       name: "Tiramisu",
//       description: "Classic Italian coffee-flavored dessert",
//       category: "Dessert",
//       preparationTime: 30,
//       yieldQuantity: 6,
//       instructions: "Layer mascarpone, coffee-soaked ladyfingers, and cocoa.",
//       sellingPrice: 6.0,
//       ingredients: [
//         { name: "whole milk", quantity: 0.3 },
//         { name: "organic eggs", quantity: 3 },
//         { name: "granulated sugar", quantity: 0.2 },
//       ],
//     },
//     {
//       name: "Pain au Chocolat",
//       description: "Chocolate-filled croissant",
//       category: "Pastry",
//       preparationTime: 120,
//       bakingTime: 20,
//       yieldQuantity: 6,
//       instructions:
//         "Prepare laminated dough, add chocolate bar, shape, and bake.",
//       sellingPrice: 4.5,
//       ingredients: [
//         { name: "flour", quantity: 0.3 },
//         { name: "organic eggs", quantity: 1 },
//         { name: "granulated sugar", quantity: 0.1 },
//       ],
//     },
//     {
//       name: "Cacao Deep",
//       description: "Rich chocolate dessert",
//       category: "Dessert",
//       preparationTime: 45,
//       bakingTime: 30,
//       yieldQuantity: 4,
//       instructions: "Mix chocolate, cream, eggs. Bake in water bath.",
//       sellingPrice: 5.5,
//       ingredients: [
//         { name: "whole milk", quantity: 0.2 },
//         { name: "organic eggs", quantity: 2 },
//         { name: "granulated sugar", quantity: 0.1 },
//       ],
//     },
//     {
//       name: "Almond Croissant",
//       description: "Buttery croissant with almond cream",
//       category: "Pastry",
//       preparationTime: 120,
//       bakingTime: 20,
//       yieldQuantity: 6,
//       instructions:
//         "Prepare laminated dough, fill with almond cream, shape, and bake.",
//       sellingPrice: 4.75,
//       ingredients: [
//         { name: "flour", quantity: 0.3 },
//         { name: "organic eggs", quantity: 1 },
//         { name: "granulated sugar", quantity: 0.1 },
//       ],
//     },
//     {
//       name: "Croque Monsieur",
//       description: "Classic French ham and cheese sandwich",
//       category: "Sandwich",
//       preparationTime: 15,
//       bakingTime: 10,
//       yieldQuantity: 2,
//       instructions:
//         "Layer ham and cheese between bread, butter outside, grill until golden.",
//       sellingPrice: 5.0,
//       ingredients: [
//         { name: "flour", quantity: 0.1 },
//         { name: "whole milk", quantity: 0.1 },
//         { name: "organic eggs", quantity: 1 },
//       ],
//     },
//     {
//       name: "Milk Tea",
//       description: "Traditional milk tea",
//       category: "Beverage",
//       preparationTime: 10,
//       yieldQuantity: 1,
//       instructions: "Brew tea, add milk and sugar.",
//       sellingPrice: 3.5,
//       ingredients: [
//         { name: "whole milk", quantity: 0.2 },
//         { name: "granulated sugar", quantity: 0.05 },
//       ],
//     },
//     {
//       name: "Chocolate Gateau",
//       description: "Rich chocolate cake",
//       category: "Cake",
//       preparationTime: 45,
//       bakingTime: 35,
//       yieldQuantity: 8,
//       instructions: "Mix chocolate, flour, eggs. Bake and decorate.",
//       sellingPrice: 6.5,
//       ingredients: [
//         { name: "flour", quantity: 0.4 },
//         { name: "organic eggs", quantity: 3 },
//         { name: "whole milk", quantity: 0.2 },
//         { name: "granulated sugar", quantity: 0.3 },
//       ],
//     },
//     {
//       name: "Cheese Cake",
//       description: "Classic creamy cheesecake",
//       category: "Cake",
//       preparationTime: 30,
//       bakingTime: 50,
//       yieldQuantity: 8,
//       instructions:
//         "Mix cream cheese, eggs, sugar. Bake in graham cracker crust.",
//       sellingPrice: 5.75,
//       ingredients: [
//         { name: "whole milk", quantity: 0.2 },
//         { name: "organic eggs", quantity: 3 },
//         { name: "granulated sugar", quantity: 0.2 },
//       ],
//     },
//     {
//       name: "Lemon Ade",
//       description: "Refreshing lemonade",
//       category: "Beverage",
//       preparationTime: 10,
//       yieldQuantity: 1,
//       instructions: "Mix lemon juice, water, and sugar.",
//       sellingPrice: 3.0,
//       ingredients: [{ name: "granulated sugar", quantity: 0.1 }],
//     },
//     {
//       name: "Angbutter",
//       description: "Traditional Korean sweet pastry with red bean and honey",
//       category: "Pastry",
//       preparationTime: 90,
//       bakingTime: 25,
//       yieldQuantity: 8,
//       instructions: "Prepare dough, fill with red bean paste, shape, and bake.",
//       sellingPrice: 4.8,
//       ingredients: [
//         { name: "flour", quantity: 0.4 },
//         { name: "whole milk", quantity: 0.3 },
//         { name: "organic eggs", quantity: 2 },
//         { name: "granulated sugar", quantity: 0.2 },
//       ],
//     },
//     {
//       name: "Croissant",
//       description: "Classic French butter croissant",
//       category: "Pastry",
//       preparationTime: 120,
//       bakingTime: 20,
//       yieldQuantity: 6,
//       instructions: "Prepare laminated dough, shape into crescents, and bake.",
//       sellingPrice: 4.2,
//       ingredients: [
//         { name: "flour", quantity: 0.5 },
//         { name: "organic eggs", quantity: 1 },
//         { name: "whole milk", quantity: 0.2 },
//       ],
//     },
//     {
//       name: "Tiramisu Croissant",
//       description: "Croissant filled with tiramisu cream",
//       category: "Pastry",
//       preparationTime: 130,
//       bakingTime: 25,
//       yieldQuantity: 6,
//       instructions:
//         "Fill croissant with coffee-infused cream and dust with cocoa.",
//       sellingPrice: 5.5,
//       ingredients: [
//         { name: "flour", quantity: 0.3 },
//         { name: "organic eggs", quantity: 1 },
//         { name: "granulated sugar", quantity: 0.1 },
//         { name: "whole milk", quantity: 0.1 },
//       ],
//     },
//     {
//       name: "Mad Garlic",
//       description: "Garlic-infused crusty bread",
//       category: "Bread",
//       preparationTime: 40,
//       bakingTime: 20,
//       yieldQuantity: 2,
//       instructions: "Mix garlic butter into dough, bake until crispy.",
//       sellingPrice: 4.8,
//       ingredients: [
//         { name: "flour", quantity: 0.3 },
//         { name: "whole milk", quantity: 0.1 },
//         { name: "organic eggs", quantity: 1 },
//       ],
//     },
//     {
//       name: "Pandoro",
//       description: "Traditional Italian Christmas sweet bread",
//       category: "Bread",
//       preparationTime: 180,
//       bakingTime: 40,
//       yieldQuantity: 1,
//       instructions: "Proof dough multiple times, bake in star-shaped mold.",
//       sellingPrice: 15.0,
//       ingredients: [
//         { name: "flour", quantity: 0.6 },
//         { name: "organic eggs", quantity: 4 },
//         { name: "granulated sugar", quantity: 0.3 },
//       ],
//     },
//     {
//       name: "Orange Pound",
//       description: "Citrus-infused pound cake",
//       category: "Cake",
//       preparationTime: 60,
//       bakingTime: 50,
//       yieldQuantity: 8,
//       instructions: "Cream butter and sugar, add eggs, flour, and orange zest.",
//       sellingPrice: 6.8,
//       ingredients: [
//         { name: "flour", quantity: 0.5 },
//         { name: "organic eggs", quantity: 3 },
//         { name: "granulated sugar", quantity: 0.3 },
//         { name: "whole milk", quantity: 0.1 },
//       ],
//     },
//     {
//       name: "Wiener",
//       description: "Viennese-style pastry sticks",
//       category: "Pastry",
//       preparationTime: 90,
//       bakingTime: 25,
//       yieldQuantity: 12,
//       instructions: "Prepare Viennese dough, shape into sticks, and bake.",
//       sellingPrice: 3.2,
//       ingredients: [
//         { name: "flour", quantity: 0.4 },
//         { name: "organic eggs", quantity: 2 },
//         { name: "granulated sugar", quantity: 0.2 },
//       ],
//     },
//     {
//       name: "Vanila Latte",
//       description: "Espresso with steamed milk and vanilla",
//       category: "Beverage",
//       preparationTime: 10,
//       yieldQuantity: 1,
//       instructions: "Brew espresso, steam milk with vanilla syrup, combine.",
//       sellingPrice: 4.8,
//       ingredients: [
//         { name: "whole milk", quantity: 0.3 },
//         { name: "granulated sugar", quantity: 0.05 },
//       ],
//     },
//     {
//       name: "Berry Ade",
//       description: "Refreshing mixed berry drink",
//       category: "Beverage",
//       preparationTime: 10,
//       yieldQuantity: 1,
//       instructions: "Mix berry puree, water, and sugar. Serve chilled.",
//       sellingPrice: 3.5,
//       ingredients: [{ name: "granulated sugar", quantity: 0.15 }],
//     },
//     {
//       name: "Merinque Cookies",
//       description: "Light and airy meringue cookies",
//       category: "Cookies",
//       preparationTime: 20,
//       bakingTime: 60,
//       yieldQuantity: 12,
//       instructions:
//         "Whip egg whites and sugar, pipe onto sheet, bake at low temp.",
//       sellingPrice: 2.5,
//       ingredients: [
//         { name: "organic eggs", quantity: 3 },
//         { name: "granulated sugar", quantity: 0.3 },
//       ],
//     },
//   ];

//   // Create recipes and their ingredients
//   for (const recipeData of recipesData) {
//     const recipe = await prisma.recipe.upsert({
//       where: { name: recipeData.name },
//       update: {}, // Keep existing recipe if already present
//       create: {
//         name: recipeData.name,
//         description: recipeData.description,
//         category: recipeData.category,
//         preparationTime: recipeData.preparationTime,
//         bakingTime: recipeData.bakingTime,
//         yieldQuantity: recipeData.yieldQuantity,
//         instructions: recipeData.instructions,
//         sellingPrice: recipeData.sellingPrice,
//       },
//     });

//     // Create recipe ingredients
//     for (const ing of recipeData.ingredients) {
//       const ingredientId = ingredientMap[ing.name];
//       if (ingredientId) {
//         await prisma.recipeIngredient.upsert({
//           where: {
//             recipeId_ingredientId: { recipeId: recipe.id, ingredientId },
//           }, // Composite unique constraint
//           update: { quantity: ing.quantity }, // Update quantity if exists
//           create: {
//             recipeId: recipe.id,
//             ingredientId: ingredientId,
//             quantity: ing.quantity,
//           },
//         });
//       }
//     }
//   }

//   console.log("✅ Recipes and their ingredients inserted successfully!");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Error seeding supplier data:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
//
//
//
//
//
//
//
//
//
//
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface SaleRecord {
  datetime: string;
  dayOfWeek: string;
  total: number;
  recipes: { name: string; quantity: number }[];
}

async function seedSalesData() {
  // Read the CSV file
  const csvFilePath = path.resolve(
    __dirname,
    "C:/Users/alant/Downloads/saleswithoutpleacecsv.csv"
  );
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  // Parse CSV
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // First, get a user to associate sales with (assuming at least one user exists)
  const user = await prisma.user.findFirstOrThrow();

  // Process and seed sales data
  for (const record of records) {
    try {
      // Parse the date properly
      // Format in CSV is "DD/MM/YYYY HH:MM" or "D/M/YYYY HH:MM"
      const [datePart, timePart] = record["datetime"].split(" ");
      const [day, month, year] = datePart
        .split("/")
        .map((num: string): number => parseInt(num, 10));
      const [hour, minute] = timePart
        .split(":")
        .map((num: string): number => parseInt(num, 10));

      // Create date object (note: month is 0-indexed in JavaScript Date)
      const datetimeObj = new Date(year, month - 1, day, hour, minute);

      // Validate the date is valid
      if (isNaN(datetimeObj.getTime())) {
        console.warn(
          `⚠️ Skipping record with invalid date: ${record["datetime"]}`
        );
        continue;
      }

      const formattedDatetime = datetimeObj.toISOString();

      // Prepare sale data
      const saleData: SaleRecord = {
        datetime: formattedDatetime,
        dayOfWeek: record["day of week"],
        total: parseFloat(record["total"]),
        recipes: [],
      };

      // Extract recipe quantities
      const recipeColumns = [
        "Angbutter",
        "Plain Bread",
        "Jam",
        "Americano",
        "Croissant",
        "Caffe Latte",
        "Tiramisu Croissant",
        "Cacao Deep",
        "Pain au Chocolat",
        "Almond Croissant",
        "Croque Monsieur",
        "Mad Garlic",
        "Milk Tea",
        "Gateau Chocolat",
        "Pandoro",
        "Cheese Cake",
        "Lemon Ade",
        "Orange Pound",
        "Wiener",
        "Vanila Latte",
        "Berry Ade",
        "Tiramisu",
        "Merinque Cookies",
      ];

      recipeColumns.forEach((recipeName) => {
        const quantity = parseInt(record[recipeName] || "0");
        if (quantity > 0) {
          saleData.recipes.push({ name: recipeName, quantity });
        }
      });

      // Create sale
      const sale = await prisma.sale.create({
        data: {
          datetime: saleData.datetime,
          dayOfWeek: saleData.dayOfWeek,
          totalAmount: saleData.total,
          userId: user.id,
        },
      });

      // Create sale items
      for (const recipeItem of saleData.recipes) {
        // Find the recipe
        const recipe = await prisma.recipe.findUnique({
          where: { name: recipeItem.name },
        });

        if (recipe) {
          await prisma.saleItem.create({
            data: {
              saleId: sale.id,
              recipeId: recipe.id,
              quantity: recipeItem.quantity,
              unitPrice: recipe.sellingPrice,
            },
          });
        } else {
          console.warn(`⚠️ Recipe not found: ${recipeItem.name}`);
        }
      }

      console.log(`✅ Imported sale from ${saleData.datetime}`);
    } catch (error) {
      console.error(`❌ Error processing record:`, record, error);
    }
  }

  console.log("✅ Sales data seeded successfully!");
}

async function main() {
  try {
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
      skipDuplicates: true,
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
        instructions:
          "Mix flour, yeast, salt. Knead, let rise, shape, and bake.",
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
      {
        name: "Angbutter",
        description: "Traditional Korean sweet pastry with red bean and honey",
        category: "Pastry",
        preparationTime: 90,
        bakingTime: 25,
        yieldQuantity: 8,
        instructions:
          "Prepare dough, fill with red bean paste, shape, and bake.",
        sellingPrice: 4.8,
        ingredients: [
          { name: "flour", quantity: 0.4 },
          { name: "whole milk", quantity: 0.3 },
          { name: "organic eggs", quantity: 2 },
          { name: "granulated sugar", quantity: 0.2 },
        ],
      },
      {
        name: "Croissant",
        description: "Classic French butter croissant",
        category: "Pastry",
        preparationTime: 120,
        bakingTime: 20,
        yieldQuantity: 6,
        instructions:
          "Prepare laminated dough, shape into crescents, and bake.",
        sellingPrice: 4.2,
        ingredients: [
          { name: "flour", quantity: 0.5 },
          { name: "organic eggs", quantity: 1 },
          { name: "whole milk", quantity: 0.2 },
        ],
      },
      {
        name: "Tiramisu Croissant",
        description: "Croissant filled with tiramisu cream",
        category: "Pastry",
        preparationTime: 130,
        bakingTime: 25,
        yieldQuantity: 6,
        instructions:
          "Fill croissant with coffee-infused cream and dust with cocoa.",
        sellingPrice: 5.5,
        ingredients: [
          { name: "flour", quantity: 0.3 },
          { name: "organic eggs", quantity: 1 },
          { name: "granulated sugar", quantity: 0.1 },
          { name: "whole milk", quantity: 0.1 },
        ],
      },
      {
        name: "Mad Garlic",
        description: "Garlic-infused crusty bread",
        category: "Bread",
        preparationTime: 40,
        bakingTime: 20,
        yieldQuantity: 2,
        instructions: "Mix garlic butter into dough, bake until crispy.",
        sellingPrice: 4.8,
        ingredients: [
          { name: "flour", quantity: 0.3 },
          { name: "whole milk", quantity: 0.1 },
          { name: "organic eggs", quantity: 1 },
        ],
      },
      {
        name: "Pandoro",
        description: "Traditional Italian Christmas sweet bread",
        category: "Bread",
        preparationTime: 180,
        bakingTime: 40,
        yieldQuantity: 1,
        instructions: "Proof dough multiple times, bake in star-shaped mold.",
        sellingPrice: 15.0,
        ingredients: [
          { name: "flour", quantity: 0.6 },
          { name: "organic eggs", quantity: 4 },
          { name: "granulated sugar", quantity: 0.3 },
        ],
      },
      {
        name: "Orange Pound",
        description: "Citrus-infused pound cake",
        category: "Cake",
        preparationTime: 60,
        bakingTime: 50,
        yieldQuantity: 8,
        instructions:
          "Cream butter and sugar, add eggs, flour, and orange zest.",
        sellingPrice: 6.8,
        ingredients: [
          { name: "flour", quantity: 0.5 },
          { name: "organic eggs", quantity: 3 },
          { name: "granulated sugar", quantity: 0.3 },
          { name: "whole milk", quantity: 0.1 },
        ],
      },
      {
        name: "Wiener",
        description: "Viennese-style pastry sticks",
        category: "Pastry",
        preparationTime: 90,
        bakingTime: 25,
        yieldQuantity: 12,
        instructions: "Prepare Viennese dough, shape into sticks, and bake.",
        sellingPrice: 3.2,
        ingredients: [
          { name: "flour", quantity: 0.4 },
          { name: "organic eggs", quantity: 2 },
          { name: "granulated sugar", quantity: 0.2 },
        ],
      },
      {
        name: "Vanila Latte",
        description: "Espresso with steamed milk and vanilla",
        category: "Beverage",
        preparationTime: 10,
        yieldQuantity: 1,
        instructions: "Brew espresso, steam milk with vanilla syrup, combine.",
        sellingPrice: 4.8,
        ingredients: [
          { name: "whole milk", quantity: 0.3 },
          { name: "granulated sugar", quantity: 0.05 },
        ],
      },
      {
        name: "Berry Ade",
        description: "Refreshing mixed berry drink",
        category: "Beverage",
        preparationTime: 10,
        yieldQuantity: 1,
        instructions: "Mix berry puree, water, and sugar. Serve chilled.",
        sellingPrice: 3.5,
        ingredients: [{ name: "granulated sugar", quantity: 0.15 }],
      },
      {
        name: "Merinque Cookies",
        description: "Light and airy meringue cookies",
        category: "Cookies",
        preparationTime: 20,
        bakingTime: 60,
        yieldQuantity: 12,
        instructions:
          "Whip egg whites and sugar, pipe onto sheet, bake at low temp.",
        sellingPrice: 2.5,
        ingredients: [
          { name: "organic eggs", quantity: 3 },
          { name: "granulated sugar", quantity: 0.3 },
        ],
      },
    ];

    // Create recipes and their ingredients
    for (const recipeData of recipesData) {
      const recipe = await prisma.recipe.upsert({
        where: { name: recipeData.name },
        update: {}, // Keep existing recipe if already present
        create: {
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
          await prisma.recipeIngredient.upsert({
            where: {
              recipeId_ingredientId: { recipeId: recipe.id, ingredientId },
            }, // Composite unique constraint
            update: { quantity: ing.quantity }, // Update quantity if exists
            create: {
              recipeId: recipe.id,
              ingredientId: ingredientId,
              quantity: ing.quantity,
            },
          });
        }
      }
    }

    console.log("✅ Recipes and their ingredients inserted successfully!");
    await seedSalesData();
  } catch (error) {
    console.error("❌ Error seeding sales data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
