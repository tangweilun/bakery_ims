import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Batch, Prisma } from "@prisma/client";

// Define interfaces for the data structures
interface IngredientUsage {
  ingredientId: number | string;
  quantity: number;
  reason: string;
}

interface StockShortage {
  ingredientId: number;
  name: string;
  needed: number;
  available: number;
  unit: string;
}

export async function POST(req: Request) {
  try {
    console.log("Starting yield API POST request");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Request Body:", JSON.stringify(body, null, 2));

    const {
      recipeId,
      quantity,
      notes,
      ingredients = [], // New structure from request
    } = body;

    console.log("recipeId:", recipeId);
    console.log("quantity:", quantity);
    console.log("notes:", notes);
    console.log("ingredients count:", ingredients.length);

    if (!Array.isArray(ingredients)) {
      console.log("Error: ingredients is not an array");
      return NextResponse.json(
        { error: "'ingredients' must be an array." },
        { status: 400 }
      );
    }

    // Fetch the recipe with its required ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: Number(recipeId) },
      include: {
        recipeIngredients: {
          include: { ingredient: true },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Transform ingredients into the needed format based on recipe quantities
    const ingredientUsage = ingredients.map((ingredient) => {
      // Find this ingredient's requirement in the recipe
      const recipeIngredient = recipe.recipeIngredients.find(
        (ri) => ri.ingredientId === Number(ingredient.id)
      );

      // If not found in recipe or no required quantity, default to 0
      const requiredQuantityPerUnit = recipeIngredient?.quantity || 0;

      // Calculate total needed based on production quantity
      const totalQuantityNeeded = requiredQuantityPerUnit * Number(quantity);

      return {
        ingredientId: ingredient.id,
        quantity: totalQuantityNeeded,
        reason: "Production",
      };
    });

    console.log("ingredientUsage:", JSON.stringify(ingredientUsage, null, 2));

    const wastageRecords = ingredients
      .filter((ingredient) => ingredient.wasted > 0)
      .map((ingredient) => ({
        ingredientId: ingredient.id,
        quantity: ingredient.wasted,
        reason: "Production wastage",
      }));
    console.log("wastageRecords:", JSON.stringify(wastageRecords, null, 2));

    // Validate stock before processing
    const ingredientIds = [
      ...new Set([
        ...ingredientUsage.map((u: IngredientUsage) => u.ingredientId),
        ...wastageRecords
          .filter((w: IngredientUsage) => w.quantity > 0)
          .map((w: IngredientUsage) => w.ingredientId),
      ]),
    ];

    console.log("ingredientIds:", JSON.stringify(ingredientIds, null, 2));

    // Fetch all ingredients with their available batches, ordered by receivedDate for FIFO
    const ingredientsRecords = await prisma.ingredient.findMany({
      where: { id: { in: ingredientIds.map((id) => Number(id)) } }, // Convert to numbers for Int IDs
      include: {
        batches: {
          where: { remainingQuantity: { gt: 0 } },
          orderBy: { receivedDate: "asc" }, // FIFO principle
        },
      },
    });
    console.log("ingredientsRecords count:", ingredientsRecords.length);

    // Calculate total quantity needed for each ingredient (usage + wastage)
    const stockShortages: StockShortage[] = [];
    const totalUsageMap = new Map<number | string, number>();

    [...ingredientUsage, ...wastageRecords].forEach(
      ({ ingredientId, quantity }: IngredientUsage) => {
        totalUsageMap.set(
          ingredientId,
          (totalUsageMap.get(ingredientId) || 0) + quantity
        );
      }
    );
    console.log("totalUsageMap:", Object.fromEntries(totalUsageMap));

    // Check if we have enough stock for all ingredients
    for (const ingredient of ingredientsRecords) {
      console.log(
        `Processing ingredient ${ingredient.id} (${ingredient.name})`
      );
      const totalNeeded = totalUsageMap.get(ingredient.id) || 0;
      console.log(`Total needed for ${ingredient.name}: ${totalNeeded}`);

      const totalAvailable = ingredient.batches.reduce(
        (sum: number, batch: { remainingQuantity: number }) =>
          sum + batch.remainingQuantity,
        0
      );
      console.log(`Total available for ${ingredient.name}: ${totalAvailable}`);

      if (totalNeeded > totalAvailable) {
        console.log(`Shortage detected for ${ingredient.name}`);
        stockShortages.push({
          ingredientId: ingredient.id,
          name: ingredient.name,
          needed: parseFloat(totalNeeded.toFixed(2)),
          available: parseFloat(totalAvailable.toFixed(2)),
          unit: ingredient.unit,
        });
      }
    }
    console.log("stockShortages:", JSON.stringify(stockShortages, null, 2));

    if (stockShortages.length > 0) {
      console.log("Error: Insufficient stock");
      return NextResponse.json(
        { message: "Insufficient stock", shortages: stockShortages },
        { status: 400 }
      );
    }

    // Transaction for production and stock updates
    console.log("Starting transaction");
    const result = await prisma.$transaction(async (tx) => {
      // Create a set to track all used batch numbers
      const usedBatchNumbers = new Set<string>();

      // Initially create production record without batch numbers (we'll update it later)
      const productionRecord = await tx.productionRecord.create({
        data: {
          recipeId: Number(recipeId),
          quantity: Number(quantity),
          // The batchNumbers field will be updated after processing all ingredients
          batchNumbers: [], // Assuming schema now has batchNumbers as string[]
          notes,
          userId: user.id,
        },
      });
      console.log("Production record created:", productionRecord.id);

      // Process ingredient usage with improved FIFO batch deduction
      for (const usage of ingredientUsage) {
        console.log(`Processing usage for ingredient ${usage.ingredientId}`);

        // Create usage record
        const usageRecord = await tx.usageRecord.create({
          data: {
            ingredientId: Number(usage.ingredientId),
            quantity: Number(usage.quantity),
            reason: usage.reason || "Production",
            productionRecordId: productionRecord.id,
            userId: user.id,
          },
        });
        console.log(`Usage record created: ${usageRecord.id}`);

        // Track how much quantity we still need to deduct
        let remainingToDeduct = Number(usage.quantity);
        console.log(`Initial quantity to deduct: ${remainingToDeduct}`);

        // Find the ingredient
        const ingredient = ingredientsRecords.find(
          (i) => i.id === Number(usage.ingredientId)
        );
        if (!ingredient) {
          console.log(`Ingredient not found: ${usage.ingredientId}`);
          continue;
        }

        // Get all available batches for this ingredient (already sorted by receivedDate ASC)
        const availableBatches = ingredient.batches.filter(
          (batch: Batch) => batch.remainingQuantity > 0
        );
        console.log(`Available batches count: ${availableBatches.length}`);

        // Loop through batches from oldest to newest until we've deducted all needed quantity
        for (const batch of availableBatches) {
          if (remainingToDeduct <= 0) break;

          // Calculate how much we can take from this batch
          const deductFromBatch = Math.min(
            batch.remainingQuantity,
            remainingToDeduct
          );
          console.log(
            `Deducting ${deductFromBatch} from batch ${batch.id} (remaining: ${batch.remainingQuantity})`
          );

          // Add this batch number to our tracking set
          usedBatchNumbers.add(batch.batchNumber);
          console.log(
            `Added batch number ${batch.batchNumber} to tracking list`
          );

          // Update the batch's remaining quantity
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              remainingQuantity: { decrement: deductFromBatch },
              updatedAt: new Date(),
            },
          });
          console.log(`Batch ${batch.id} updated, deducted ${deductFromBatch}`);

          // Create batch usage record for traceability
          await tx.batchUsage.create({
            data: {
              batchId: batch.id,
              usageRecordId: usageRecord.id,
              quantityUsed: deductFromBatch,
            },
          });
          console.log(`Batch usage record created for batch ${batch.id}`);

          // Reduce the remaining amount to deduct
          remainingToDeduct -= deductFromBatch;
          console.log(`Remaining to deduct: ${remainingToDeduct}`);
        }

        // Ensure we've deducted everything
        if (remainingToDeduct > 0) {
          console.log(
            `Error: Could not deduct full quantity for ingredient ${ingredient.name}`
          );
          throw new Error(
            `Unexpected error: Could not deduct full quantity for ingredient ${ingredient.name}`
          );
        }

        // Update ingredient current stock
        await tx.ingredient.update({
          where: { id: Number(usage.ingredientId) },
          data: { currentStock: { decrement: Number(usage.quantity) } },
        });
        console.log(`Updated current stock for ingredient ${ingredient.id}`);

        // Log this activity
        await tx.activity.create({
          data: {
            action: "INGREDIENT_USED",
            description: `Used ${usage.quantity} ${ingredient.unit} of ${ingredient.name} for production #${productionRecord.id}`,
            userId: user.id,
            ingredientId: ingredient.id,
            usageRecordId: usageRecord.id,
            productionRecordId: productionRecord.id,
          },
        });
        console.log(`Activity logged for ingredient usage ${ingredient.id}`);
      }

      // Process wastage records
      for (const wastage of wastageRecords) {
        if (Number(wastage.quantity) <= 0) continue; // Skip zero or negative wastage

        // Create usage record for wastage
        const wastageUsageRecord = await tx.usageRecord.create({
          data: {
            ingredientId: Number(wastage.ingredientId),
            quantity: Number(wastage.quantity),
            reason: wastage.reason || "Production wastage",
            productionRecordId: productionRecord.id,
            userId: user.id,
          },
        });

        // Track how much quantity we still need to deduct
        let remainingToDeduct = Number(wastage.quantity);

        // Find the ingredient
        const ingredient = ingredientsRecords.find(
          (i) => i.id === Number(wastage.ingredientId)
        );
        if (!ingredient) continue;

        // Get all available batches for this ingredient (already sorted by receivedDate ASC)
        const availableBatches = ingredient.batches.filter(
          (batch: Batch) => batch.remainingQuantity > 0
        );

        // Loop through batches from oldest to newest until we've deducted all needed quantity
        for (const batch of availableBatches) {
          if (remainingToDeduct <= 0) break;

          // Calculate how much we can take from this batch
          const deductFromBatch = Math.min(
            batch.remainingQuantity,
            remainingToDeduct
          );

          // Add this batch number to our tracking set
          usedBatchNumbers.add(batch.batchNumber);

          // Update the batch's remaining quantity
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              remainingQuantity: { decrement: deductFromBatch },
              updatedAt: new Date(),
            },
          });

          // Create batch usage record for traceability
          await tx.batchUsage.create({
            data: {
              batchId: batch.id,
              usageRecordId: wastageUsageRecord.id,
              quantityUsed: deductFromBatch,
            },
          });

          // Reduce the remaining amount to deduct
          remainingToDeduct -= deductFromBatch;
        }

        // Ensure we've deducted everything
        if (remainingToDeduct > 0) {
          throw new Error(
            `Unexpected error: Could not deduct full quantity for wasted ingredient ${ingredient.name}`
          );
        }

        // Update ingredient current stock
        await tx.ingredient.update({
          where: { id: Number(wastage.ingredientId) },
          data: { currentStock: { decrement: Number(wastage.quantity) } },
        });

        // Log this activity
        await tx.activity.create({
          data: {
            action: "INGREDIENT_USED",
            description: `Recorded ${wastage.quantity} ${ingredient.unit} of ${ingredient.name} as wastage during production #${productionRecord.id}`,
            userId: user.id,
            ingredientId: ingredient.id,
            usageRecordId: wastageUsageRecord.id,
            productionRecordId: productionRecord.id,
          },
        });
      }

      // Convert the Set of batch numbers to an array and update the production record
      const batchNumbersArray = Array.from(usedBatchNumbers);
      console.log(
        `Updating production record with batch numbers: ${batchNumbersArray.join(
          ", "
        )}`
      );

      // Update the production record with all used batch numbers
      const updatedProductionRecord = await tx.productionRecord.update({
        where: { id: productionRecord.id },
        data: {
          batchNumbers: batchNumbersArray,
        },
      });
      console.log(
        `Updated production record with batch numbers: ${updatedProductionRecord.batchNumbers.join(
          ", "
        )}`
      );

      // Log the production completion
      await tx.activity.create({
        data: {
          action: "PRODUCTION_COMPLETED",
          description: `Completed production of ${quantity} units of recipe #${recipeId} using batches: ${batchNumbersArray.join(
            ", "
          )}`,
          userId: user.id,
          productionRecordId: productionRecord.id,
        },
      });

      return updatedProductionRecord;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in yield management:", error);
    return NextResponse.json(
      {
        message: "Error processing production",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("Starting yield history API GET request");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse URL to get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const recipeId = searchParams.get("recipeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const batchNumber = searchParams.get("batchNumber");
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Prisma.ProductionRecordWhereInput = {};
    if (recipeId && recipeId !== "none") {
      where.recipeId = parseInt(recipeId);
    }

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        // Add one day to include the end date fully
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        where.createdAt.lt = endDateObj;
      }
    }
    // Add batch number filter
    if (batchNumber) {
      where.batchNumbers = {
        has: batchNumber,
      };
    }
    // Get total count for pagination
    const totalCount = await prisma.productionRecord.count({ where });

    // Fetch production records with related data
    const records = await prisma.productionRecord.findMany({
      where,
      include: {
        recipe: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        usageRecords: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Group usage records by production record
    const formattedRecords = records.map((record) => {
      // Group usage records by reason
      const ingredientUsage = record.usageRecords.filter(
        (usage) => usage.reason === "Production"
      );

      const wastage = record.usageRecords.filter((usage) =>
        usage.reason.includes("wastage")
      );

      return {
        id: record.id,
        recipeId: record.recipeId,
        recipeName: record.recipe.name,
        quantity: record.quantity,
        batchNumbers: record.batchNumbers,
        notes: record.notes,
        createdAt: record.createdAt,
        userId: record.userId,
        userName: record.user.name,
        userEmail: record.user.email,
        ingredients: ingredientUsage.map((usage) => ({
          id: usage.ingredientId,
          name: usage.ingredient.name,
          quantity: usage.quantity,
          unit: usage.ingredient.unit,
        })),
        wastage: wastage.map((usage) => ({
          id: usage.ingredientId,
          name: usage.ingredient.name,
          quantity: usage.quantity,
          unit: usage.ingredient.unit,
        })),
      };
    });

    return NextResponse.json(
      {
        records: formattedRecords,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching yield history:", error);
    return NextResponse.json(
      {
        message: "Error fetching production records",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
