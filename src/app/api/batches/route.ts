// app/api/batches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch batches with ingredient details
    const batches = await prisma.batch.findMany({
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const userData = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      batchNumber,
      ingredientId,
      ingredientName,
      quantity,
      cost,
      expiryDate,
      location,
      notes,
    } = body;

    // Validate input data
    if (!batchNumber || !ingredientId || quantity <= 0 || cost < 0) {
      return NextResponse.json(
        {
          error:
            "Invalid batch data. Required fields: batchNumber, ingredientId, quantity (> 0)",
        },
        { status: 400 }
      );
    }

    // Check if batch number already exists
    const existingBatch = await prisma.batch.findUnique({
      where: { batchNumber },
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: "Batch number already exists" },
        { status: 400 }
      );
    }

    // Create a transaction to handle both batch creation and ingredient stock update
    const result = await prisma.$transaction(async (tx) => {
      // Create new batch
      const newBatch = await tx.batch.create({
        data: {
          batchNumber,
          ingredientId,
          quantity,
          remainingQuantity: quantity, // Initially, remaining = total quantity
          cost,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          location,
          notes,
        },
      });

      // Update ingredient's current stock
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          currentStock: {
            increment: quantity,
          },
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          action: "BATCH_CREATED",
          description: `New batch ${batchNumber} added for ingredient ${ingredientName}`,
          details: JSON.stringify({
            batchNumber,
            quantity,
            cost,
            expiryDate,
          }),
          userId: userData.id,
          ingredientId,
          batchId: newBatch.id,
        },
      });

      return newBatch;
    });

    // Fetch the complete batch with ingredient details for response
    const batchWithIngredient = await prisma.batch.findUnique({
      where: { id: result.id },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(batchWithIngredient);
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}
