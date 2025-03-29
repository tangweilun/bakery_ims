import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";

interface SaleItem {
  recipeId: number; // Changed from string to number
  quantity: number;
  unitPrice: number;
}

interface SaleRequestBody {
  userId: string;
  saleItems: SaleItem[];
  datetime: string;
  dayOfWeek: string;
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        saleItems: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: {
        datetime: "desc",
      },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Validate request body
    const contentType = req.headers.get("content-type");
    if (contentType !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type. Expected application/json" },
        { status: 415 }
      );
    }

    let body: SaleRequestBody;
    try {
      body = await req.json();
    } catch (parseError) {
      console.warn("Error parsing JSON in request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request body structure
    const { saleItems, datetime, dayOfWeek } = body;

    if (
      !Array.isArray(saleItems) ||
      saleItems.length === 0 ||
      !datetime ||
      !dayOfWeek
    ) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: {
            saleItems: saleItems?.length || 0,
            datetime: !!datetime,
            dayOfWeek: !!dayOfWeek,
          },
        },
        { status: 400 }
      );
    }

    // Validate sale items
    const validationErrors = saleItems.reduce<string[]>(
      (errors, item, index) => {
        if (typeof item.recipeId !== "number" || item.recipeId <= 0)
          errors.push(`Sale item ${index}: Invalid recipeId`);
        if (typeof item.quantity !== "number" || item.quantity <= 0)
          errors.push(`Sale item ${index}: Invalid quantity`);
        if (typeof item.unitPrice !== "number" || item.unitPrice < 0)
          errors.push(`Sale item ${index}: Invalid unit price`);
        return errors;
      },
      []
    );

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    const totalAmount = saleItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    try {
      const sale = await prisma.$transaction(
        async (tx) => {
          const createdSale = await tx.sale.create({
            data: {
              userId: user.id,
              datetime: new Date(datetime),
              dayOfWeek,
              totalAmount,
              saleItems: {
                create: saleItems.map((item) => ({
                  recipe: {
                    connect: {
                      id: item.recipeId,
                    },
                  },
                  // Remove the recipeId field here as it's handled by the connect relation
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                })),
              },
              activities: {
                create: {
                  action: "SALE_CREATED",
                  description: `Sale created with total amount $${totalAmount.toFixed(
                    2
                  )}`,
                  userId: user.id,
                  details: JSON.stringify({
                    totalItems: saleItems.length,
                    items: saleItems.map((item) => ({
                      recipeId: item.recipeId,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                    })),
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
              activities: true,
            },
          });

          return createdSale;
        },
        {
          isolationLevel: "Serializable",
        }
      );

      return NextResponse.json(sale, { status: 201 });
    } catch (dbError) {
      // Handle specific Prisma errors
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (dbError.code === "P2002") {
          return NextResponse.json(
            { error: "Unique constraint violation", details: dbError.message },
            { status: 409 }
          );
        }
        // Foreign key constraint violation
        if (dbError.code === "P2003") {
          return NextResponse.json(
            { error: "Related record not found", details: dbError.message },
            { status: 404 }
          );
        }
      }

      // Rethrow unexpected database errors
      throw dbError;
    }
  } catch (error) {
    console.error("Unexpected error creating sale:", error);

    // More detailed error response
    const errorResponse = {
      error: "Failed to create sale",
      details:
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
            }
          : "Unknown error",
      // Only include stack trace in development
      ...(process.env.NODE_ENV === "development" && error instanceof Error
        ? { stack: error.stack }
        : {}),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
