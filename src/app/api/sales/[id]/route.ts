import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

interface SaleItem {
  recipeId: number;
  quantity: number;
  unitPrice: number;
}

interface UpdateSaleRequestBody {
  datetime: string;
  dayOfWeek: string;
  saleItems: SaleItem[];
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase server client
    const supabase = await createClient();

    // Get user session from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const saleId = parseInt(id);

    if (isNaN(saleId)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
    }

    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { saleItems: true },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Parse request body
    const body: UpdateSaleRequestBody = await req.json();
    const { datetime, dayOfWeek, saleItems } = body;

    // Validate request data
    if (
      !datetime ||
      !dayOfWeek ||
      !Array.isArray(saleItems) ||
      saleItems.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = saleItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    // Update sale in a transaction
    const updatedSale = await prisma.$transaction(async (tx) => {
      // Delete existing sale items
      await tx.saleItem.deleteMany({
        where: { saleId },
      });

      // Update sale and create new sale items
      const updated = await tx.sale.update({
        where: { id: saleId },
        data: {
          datetime: new Date(datetime),
          dayOfWeek,
          totalAmount,
          saleItems: {
            create: saleItems.map((item) => ({
              recipe: {
                connect: { id: item.recipeId },
              },
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          activities: {
            create: {
              action: "SALE_UPDATED",
              description: `Sale updated with total amount $${totalAmount.toFixed(
                2
              )}`,
              userId: user.id,
              details: JSON.stringify({
                totalItems: saleItems.length,
                items: saleItems,
              }),
            },
          },
        },
        include: {
          saleItems: {
            include: {
              recipe: true,
            },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase server client
    const supabase = await createClient();

    // Get user session from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const saleId = parseInt(id);
    if (isNaN(saleId)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 });
    }

    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Delete sale in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete sale items first (due to foreign key constraints)
      await tx.saleItem.deleteMany({
        where: { saleId },
      });

      // Create activity record
      await tx.activity.create({
        data: {
          action: "SALE_DELETED",
          description: `Sale deleted with ID ${saleId}`,
          userId: user.id,
          details: JSON.stringify({
            saleId,
            datetime: existingSale.datetime,
            totalAmount: existingSale.totalAmount,
          }),
        },
      });

      // Delete the sale
      await tx.sale.delete({
        where: { id: saleId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
