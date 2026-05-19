import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

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
    const collection = await dbConnect(collections.achievements);

    const updateData: any = { ...body, updatedAt: new Date() };
    delete updateData._id;
    delete updateData.userId;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    if (updateData.points !== undefined) {
      updateData.points = Number(updateData.points) || 100;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "অর্জন পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "অর্জন সফলভাবে আপডেট করা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating achievement:", error);
    return NextResponse.json({ error: "অর্জন আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
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

    const collection = await dbConnect(collections.achievements);
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "অর্জন পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "অর্জন সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json({ error: "অর্জন মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
