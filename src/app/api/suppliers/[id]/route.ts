import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(params.id) },
    });
    if (!supplier)
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const updatedSupplier = await prisma.supplier.update({
      where: { id: Number(params.id) },
      data,
    });
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { id?: string } }
) {
  try {
    // Destructure id from params to properly handle dynamic route params
    const { id } = params;

    // Validate if `id` is provided and is a valid number
    const supplierId = Number(id);
    if (!id || isNaN(supplierId)) {
      return NextResponse.json(
        { error: "Invalid or missing supplier ID" },
        { status: 400 }
      );
    }

    // Check if supplier exists before deleting
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Delete the supplier
    await prisma.supplier.delete({ where: { id: supplierId } });

    return NextResponse.json(
      { message: "Supplier deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Delete Supplier Error:", error);

    // Ensure error is properly typed
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { error: "Failed to delete supplier", details: errorMessage },
      { status: 500 }
    );
  }
}
