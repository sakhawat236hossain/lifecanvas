import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.memories);
    const memory = await collection.findOne({ _id: new ObjectId(id) });

    if (!memory) {
      return NextResponse.json({ error: "স্মৃতি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json(memory, { status: 200 });
  } catch (error) {
    console.error("Error fetching memory:", error);
    return NextResponse.json({ error: "স্মৃতি আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const body = await request.json();
    const collection = await dbConnect(collections.memories);

    const updateData = { ...body, updatedAt: new Date() };
    delete updateData._id; // Prevent updating the ID

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "স্মৃতি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "স্মৃতি সফলভাবে আপডেট হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json({ error: "স্মৃতি আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.memories);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "স্মৃতি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "স্মৃতি সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json({ error: "স্মৃতি মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
