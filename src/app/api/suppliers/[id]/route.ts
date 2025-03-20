// File: app/api/suppliers/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for validation
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET handler to fetch a single supplier
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await params before using them
    const { id } = context.params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { message: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { message: "Error fetching supplier" },
      { status: 500 }
    );
  }
}

// PUT handler to update supplier
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await params before using them
    const { id } = context.params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { message: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = supplierSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    // Update the supplier
    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: body.name,
        contactPerson: body.contactPerson || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { message: "Error updating supplier" },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a supplier
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await params before using them
    const { id } = context.params;
    const supplierId = parseInt(id);

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { message: "Invalid supplier ID" },
        { status: 400 }
      );
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    // Delete the supplier
    await prisma.supplier.delete({
      where: { id: supplierId },
    });

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { message: "Error deleting supplier" },
      { status: 500 }
    );
  }
}
