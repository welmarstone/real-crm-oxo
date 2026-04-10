import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const note = await prisma.clientNote.create({
      data: { clientId: params.id, content: content.trim() }
    });

    revalidatePath(`/dashboard/clients/${params.id}`);
    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
