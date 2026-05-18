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

    const collection = await dbConnect(collections.journals);
    const journal = await collection.findOne({ _id: new ObjectId(id) });

    if (!journal) {
      return NextResponse.json({ error: "দিনলিপি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json(journal, { status: 200 });
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json({ error: "দিনলিপি আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const body = await request.json();
    const collection = await dbConnect(collections.journals);

    const updateData: any = { ...body, updatedAt: new Date() };
    delete updateData._id;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "দিনলিপি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "দিনলিপি সফলভাবে আপডেট করা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating journal:", error);
    return NextResponse.json({ error: "দিনলিপি আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.journals);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "দিনলিপি পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ message: "দিনলিপি সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting journal:", error);
    return NextResponse.json({ error: "দিনলিপি মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
