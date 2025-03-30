import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    const expiringBatches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          gte: today,
          lte: sevenDaysLater,
        },
      },
      include: {
        ingredient: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    return NextResponse.json({ expiringBatches });
  } catch (error) {
    console.error("Error fetching expiring batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch expiring batches" },
      { status: 500 }
    );
  }
}