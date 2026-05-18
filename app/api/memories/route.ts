import { NextResponse } from "next/server";
import { dbConnect, collections } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const topic = searchParams.get("topic") || "";
    const sort = searchParams.get("sort") || "desc"; // desc = newest first
    
    const collection = await dbConnect(collections.memories);
    
    let query: any = {};
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

    return NextResponse.json(memories, { status: 200 });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json({ error: "স্মৃতিসমূহ আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collection = await dbConnect(collections.memories);

    // Provide default values
    const newMemory = {
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
