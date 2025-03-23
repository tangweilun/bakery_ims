// File: /app/api/batches/[id]/usage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const batchId = parseInt(id);

    if (isNaN(batchId)) {
      return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
    }

    // Get basic batch info
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { ingredient: true },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Get batch usage records
    const batchUsages = await prisma.batchUsage.findMany({
      where: { batchId },
      include: {
        usageRecord: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            productionRecord: {
              select: {
                recipe: {
                  select: {
                    name: true,
                  },
                },
                quantity: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      batch,
      batchUsages,
    });
  } catch (error) {
    console.error("Error fetching batch usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch usage data" },
      { status: 500 }
    );
  }
}
