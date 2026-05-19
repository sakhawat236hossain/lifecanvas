import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const topic = searchParams.get("topic") || "";
    const sort = searchParams.get("sort") || "desc"; // desc = newest first
    
    const collection = await dbConnect(collections.memories);
    
    let query: any = {
      $or: [
        { topic: { $ne: "ভালোবাসার গল্প" } },
        { topic: "ভালোবাসার গল্প", userId: { $in: [dbUserId, userEmail] } }
      ]
    };
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (topic && topic !== "All" && topic !== "সব") {
      query.topic = topic;
    }

    const sortOption: any = sort === "desc" ? { date: -1 } : { date: 1 };
    
    const memories = await collection
      .find(query)
      .sort(sortOption)
      .toArray();

    // Fetch all users to map creator name and avatar
    const users = await usersCol.find({}).toArray();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const memoriesWithCreators = memories.map(m => {
      const creator = userMap.get(m.userId);
      return {
        ...m,
        creatorName: creator?.name || "LifeCanvas User",
        creatorImage: creator?.image || null
      };
    });

    return NextResponse.json(memoriesWithCreators, { status: 200 });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json({ error: "স্মৃতিসমূহ আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const collection = await dbConnect(collections.memories);

    // Provide default values
    const newMemory = {
      userId: dbUserId,
      title: body.title,
      topic: body.topic,
      description: body.description,
      image: body.image || null,
      mood: body.mood || "Neutral",
      tags: body.tags || [],
      date: body.date ? new Date(body.date) : new Date(),
      location: body.location || "",
      privacy: body.privacy || "Private",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newMemory);

    return NextResponse.json(
      { message: "স্মৃতি সফলভাবে তৈরি হয়েছে", id: result.insertedId, ...newMemory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating memory:", error);
    return NextResponse.json({ error: "স্মৃতি তৈরি করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
