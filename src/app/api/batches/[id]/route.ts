// app/api/batches/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Prisma } from "@prisma/client";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const batchId = parseInt(id);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
    }

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: true,
          },
        },
        batchUsages: {
          include: {
            usageRecord: {
              include: {
                productionRecord: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { email: data.user.email! },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const batchId = parseInt(id);
    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
    }

    const body = await request.json();
    const { expiryDate, location, notes } = body;

    // Strict type for updateData
    const updateData: Partial<Prisma.BatchUpdateInput> = {};

    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    if (location !== undefined) {
      updateData.location = location;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update batch and log activity within a transaction
    await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.update({
        where: { id: batchId },
        data: updateData,
        include: {
          ingredient: true,
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          action: "BATCH_UPDATED",
          description: `Batch ${batch.batchNumber} updated`,
          details: JSON.stringify(updateData),
          userId: userData.id,
          ingredientId: batch.ingredientId,
          batchId: batch.id,
        },
      });

      return batch;
    });

    // Return updated batch with ingredient details
    const batchWithIngredient = await prisma.batch.findUnique({
      where: { id: batchId },
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

    if (!batchWithIngredient) {
      return NextResponse.json(
        { error: "Batch not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json(batchWithIngredient);
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const batchId = parseInt(id);

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

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if batch has any usage records
    const batchUsageCount = await prisma.batchUsage.count({
      where: { batchId },
    });

    if (batchUsageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete batch with existing usage records" },
        { status: 400 }
      );
    }

    // Create activity log entry
    await prisma.activity.create({
      data: {
        action: "BATCH_DELETED",
        description: `Batch ${batch.batchNumber} deleted`,
        details: JSON.stringify({
          batchNumber: batch.batchNumber,
          ingredientId: batch.ingredientId,
          quantity: batch.quantity,
        }),
        batchId: batchId, // This will be removed when the batch is deleted, but useful for the log
        userId: user.id, // You should replace this with the actual user ID from your auth system
      },
    });

    // Delete the batch
    await prisma.batch.delete({
      where: { id: batchId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 }
    );
  }
}
