import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const collection = await dbConnect(collections.journals);
    const journals = await collection.find({ userId }).sort({ date: -1 }).toArray();
    return NextResponse.json(journals, { status: 200 });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { error: "দিনলিপি সংগ্রহ করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const collection = await dbConnect(collections.journals);

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "শিরোনাম এবং বিবরণ উভয়ই আবশ্যক" },
        { status: 400 }
      );
    }

    const newJournal = {
      userId,
      title: body.title,
      content: body.content,
      mood: body.mood || "শান্তপূর্ণ",
      date: body.date ? new Date(body.date) : new Date(),
      audio: body.audio || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newJournal);

    return NextResponse.json(
      { message: "দিনলিপি সফলভাবে সংরক্ষিত হয়েছে", id: result.insertedId, ...newJournal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating journal:", error);
    return NextResponse.json(
      { error: "দিনলিপি সংরক্ষণ করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
