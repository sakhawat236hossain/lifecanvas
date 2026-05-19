import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.journals);
    const journal = await collection.findOne({ _id: new ObjectId(id), userId });

    if (!journal) {
      return NextResponse.json({ error: "দিনলিপি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json(journal, { status: 200 });
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json({ error: "দিনলিপি আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const body = await request.json();
    const collection = await dbConnect(collections.journals);

    const updateData: any = { ...body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.userId;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "দিনলিপি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "দিনলিপি সফলভাবে আপডেট করা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating journal:", error);
    return NextResponse.json({ error: "দিনলিপি আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.journals);
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "দিনলিপি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "দিনলিপি সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting journal:", error);
    return NextResponse.json({ error: "দিনলিপি মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
