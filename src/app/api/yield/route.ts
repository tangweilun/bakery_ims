import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Batch } from "@prisma/client";

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

    // Transform ingredients into the needed format
    const ingredientUsage = ingredients.map((ingredient) => ({
      ingredientId: ingredient.id,
      quantity: 1, // Default usage quantity per ingredient
      reason: "Production",
    }));
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
        ...ingredientUsage.map((u: any) => u.ingredientId),
        ...wastageRecords
          .filter((w: any) => w.quantity > 0)
          .map((w: any) => w.ingredientId),
      ]),
    ];

    console.log("ingredientIds:", JSON.stringify(ingredientIds, null, 2));

    // Find the oldest batch for each ingredient (FIFO)
    const oldestBatch = await prisma.batch.findFirst({
      where: {
        ingredientId: { in: ingredientIds },
        remainingQuantity: { gt: 0 }, // Ensure batch has stock
      },
      orderBy: {
        receivedDate: "asc", // FIFO: oldest batch first
      },
    });
    console.log("oldestBatch:", JSON.stringify(oldestBatch, null, 2));

    if (!oldestBatch) {
      console.log("Error: No available batch found for ingredients");
      return NextResponse.json(
        { error: "No available batch found for ingredients" },
        { status: 400 }
      );
    }

    const oldestBatchNumber = oldestBatch.batchNumber; // Use the oldest batch number
    console.log("oldestBatchNumber:", oldestBatchNumber);

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
    const stockShortages: any[] = [];
    const totalUsageMap = new Map();

    [...ingredientUsage, ...wastageRecords].forEach(
      ({ ingredientId, quantity }: any) => {
        totalUsageMap.set(
          ingredientId,
          (totalUsageMap.get(ingredientId) || 0) + quantity
        );
      }
    );
    console.log("totalUsageMap:", Object.fromEntries(totalUsageMap));

    // Check if we have enough stock for all ingredients
    for (const ingredient of ingredientsRecords) {
      console.log(`Processing ingredient ${ingredient.id} (${ingredient.name})`);
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
          needed: totalNeeded,
          available: totalAvailable,
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
      // Create production record
      const productionRecord = await tx.productionRecord.create({
        data: {
          recipeId: Number(recipeId),
          quantity: Number(quantity),
          batchNumber: oldestBatchNumber,
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
          console.log(`Deducting ${deductFromBatch} from batch ${batch.id} (remaining: ${batch.remainingQuantity})`);

          // Update the batch's remaining quantity
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              remainingQuantity: { decrement: deductFromBatch },
              updatedAt: new Date(), // Use updatedAt as the timestamp
            },
          });
          console.log(`Batch ${batch.id} updated, deducted ${deductFromBatch}`);

          // Create batch usage record for traceability using your existing BatchUsage model
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
          console.log(`Error: Could not deduct full quantity for ingredient ${ingredient.name}`);
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

        // Create usage record for wastage (using your UsageRecord model since you don't have a separate WastageRecord)
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
        const ingredient = ingredients.find(
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

          // Update the batch's remaining quantity
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              remainingQuantity: { decrement: deductFromBatch },
              updatedAt: new Date(), // Use updatedAt as the timestamp
            },
          });

          // Create batch usage record for traceability using your existing BatchUsage model
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

      // Log the production completion
      await tx.activity.create({
        data: {
          action: "PRODUCTION_COMPLETED",
          description: `Completed production of ${quantity} units of recipe #${recipeId}`,
          userId: user.id,
          productionRecordId: productionRecord.id,
        },
      });

      return productionRecord;
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
