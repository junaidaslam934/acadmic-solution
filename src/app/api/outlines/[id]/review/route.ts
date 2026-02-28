import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseOutline, { OutlineApprovalStatus } from '@/models/CourseOutline';
import OutlineReview from '@/models/OutlineReview';
import CourseAssignment from '@/models/CourseAssignment';

// Review chain: class_advisor -> ug_coordinator -> co_chairman -> chairman
const REVIEW_CHAIN: Record<string, { nextRole: string | null; nextStatus: OutlineApprovalStatus }> = {
  class_advisor: { nextRole: 'ug_coordinator', nextStatus: 'coordinator_review' },
  ug_coordinator: { nextRole: 'co_chairman', nextStatus: 'co_chairman_review' },
  co_chairman: { nextRole: 'chairman', nextStatus: 'chairman_review' },
  chairman: { nextRole: null, nextStatus: 'approved' },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { reviewerId, reviewerRole, decision, comments } = body;

    if (!reviewerId || !reviewerRole || !decision) {
      return NextResponse.json(
        { success: false, error: 'reviewerId, reviewerRole, and decision are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(decision)) {
      return NextResponse.json(
        { success: false, error: 'decision must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const outline = await CourseOutline.findById(id);
    if (!outline) {
      return NextResponse.json({ success: false, error: 'Outline not found' }, { status: 404 });
    }

    // Verify the reviewer is the current expected reviewer
    if (outline.currentReviewerRole !== reviewerRole) {
      return NextResponse.json(
        { success: false, error: `This outline is currently awaiting review from ${outline.currentReviewerRole}, not ${reviewerRole}` },
        { status: 403 }
      );
    }

    // Create review record
    await OutlineReview.create({
      outlineId: id,
      reviewerId,
      reviewerRole,
      decision,
      comments: comments || '',
    });

    if (decision === 'rejected') {
      // Rejection at any stage sends back to teacher
      outline.status = 'rejected' as OutlineApprovalStatus;
      outline.currentReviewerRole = null;
      await outline.save();

      // Update assignment
      await CourseAssignment.findByIdAndUpdate(outline.assignmentId, {
        outlineStatus: 'rejected',
      });
    } else {
      // Approved — advance to next reviewer
      const chain = REVIEW_CHAIN[reviewerRole];
      if (!chain) {
        return NextResponse.json({ success: false, error: 'Invalid reviewer role' }, { status: 400 });
      }

      outline.status = chain.nextStatus as OutlineApprovalStatus;
      outline.currentReviewerRole = chain.nextRole as 'class_advisor' | 'ug_coordinator' | 'co_chairman' | 'chairman' | null;
      await outline.save();

      // Update assignment outline status
      await CourseAssignment.findByIdAndUpdate(outline.assignmentId, {
        outlineStatus: chain.nextStatus,
      });
    }

    const updated = await CourseOutline.findById(id)
      .populate('teacherId', 'name email')
      .populate('courseId', 'courseCode courseName')
      .lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
