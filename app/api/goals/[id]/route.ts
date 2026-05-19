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
    const collection = await dbConnect(collections.goals);

    const updateData: any = { ...body, updatedAt: new Date() };
    delete updateData._id; // Prevent updating the ID
    delete updateData.userId; // Prevent updating the userId

    // Parse numeric fields if they are sent
    if (updateData.target !== undefined) updateData.target = Number(updateData.target);
    if (updateData.current !== undefined) updateData.current = Number(updateData.current);
    if (updateData.deadline) updateData.deadline = new Date(updateData.deadline);

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "লক্ষ্য পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "লক্ষ্য সফলভাবে আপডেট হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ error: "লক্ষ্য আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
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

    const collection = await dbConnect(collections.goals);
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "লক্ষ্য পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "লক্ষ্য সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json({ error: "লক্ষ্য মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
