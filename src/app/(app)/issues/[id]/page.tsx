export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { IssueDetailContainer } from './IssueDetailContainer';
import { Loader2 } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

function LoadingFallback() {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default async function IssueDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <IssueDetailContainer issueId={id} />
    </Suspense>
  );
}
