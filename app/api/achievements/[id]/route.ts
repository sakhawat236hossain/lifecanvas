import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const body = await request.json();
    const collection = await dbConnect(collections.achievements);

    const updateData: any = { ...body, updatedAt: new Date() };
    delete updateData._id;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.points !== undefined) {
      updateData.points = Number(updateData.points) || 100;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "অর্জন পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "অর্জন সফলভাবে আপডেট করা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating achievement:", error);
    return NextResponse.json({ error: "অর্জন আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.achievements);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "অর্জন পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "অর্জন সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json({ error: "অর্জন মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
