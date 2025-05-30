import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId")?.trim();
  const studentId = searchParams.get("studentId")?.trim();

  const existingApplication = await prisma.application.findMany({
    where: { jobId, studentId },
  });

  return new Response(
    JSON.stringify({ hasApplied: !!existingApplication }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
