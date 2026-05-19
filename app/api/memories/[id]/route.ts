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
    const sessionUserId = (session.user as any).id;
    const sessionUserEmail = session.user.email ? session.user.email.toLowerCase() : "";

    const usersCol = await dbConnect(collections.users);
    
    // Resolve user document from database by email first, fallback to id
    let currentUser = null;
    if (sessionUserEmail) {
      currentUser = await usersCol.findOne({ email: sessionUserEmail });
    }
    if (!currentUser && ObjectId.isValid(sessionUserId)) {
      currentUser = await usersCol.findOne({ _id: new ObjectId(sessionUserId) });
    }

    const dbUserId = currentUser ? currentUser._id.toString() : sessionUserId;
    const userEmail = currentUser ? currentUser.email.toLowerCase() : sessionUserEmail;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "অবৈধ আইডি ফরম্যাট" }, { status: 400 });
    }

    const collection = await dbConnect(collections.memories);
    const memory = await collection.findOne({
      _id: new ObjectId(id),
      $or: [
        { topic: { $ne: "ভালোবাসার গল্প" } },
        { topic: "ভালোবাসার গল্প", userId: { $in: [dbUserId, userEmail] } }
      ]
    });

    if (!memory) {
      return NextResponse.json({ error: "স্মৃতি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    let creator = null;
    try {
      if (ObjectId.isValid(memory.userId)) {
        creator = await usersCol.findOne({ _id: new ObjectId(memory.userId) });
      }
      if (!creator) {
        creator = await usersCol.findOne({ email: memory.userId });
      }
    } catch (e) {
      creator = null;
    }

    const memoryWithCreator = {
      ...memory,
      creatorName: creator?.name || "LifeCanvas User",
      creatorImage: creator?.image || null
    };

    return NextResponse.json(memoryWithCreator, { status: 200 });
  } catch (error) {
    console.error("Error fetching memory:", error);
    return NextResponse.json({ error: "স্মৃতি আনতে ব্যর্থ হয়েছে" }, { status: 500 });
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
    const collection = await dbConnect(collections.memories);

    const updateData = { ...body, updatedAt: new Date() };
    delete updateData._id; // Prevent updating the ID
    delete updateData.userId; // Prevent updating the userId

    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "স্মৃতি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "স্মৃতি সফলভাবে আপডেট হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json({ error: "স্মৃতি আপডেট করতে ব্যর্থ হয়েছে" }, { status: 500 });
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

    const collection = await dbConnect(collections.memories);
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "স্মৃতি পাওয়া যায়নি বা অ্যাক্সেস নেই" }, { status: 404 });
    }

    return NextResponse.json({ message: "স্মৃতি সফলভাবে মুছে ফেলা হয়েছে" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json({ error: "স্মৃতি মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
