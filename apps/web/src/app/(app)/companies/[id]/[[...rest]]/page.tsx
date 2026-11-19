import { redirect } from 'next/navigation';

/**
 * Links the API puts in notifications. Sends each one to the screen that shows it today. Old
 * links to orders, bookings and lawyer review (removed 19 Nov 2026) land on the company.
 */
const TARGETS: Record<string, string> = {};

export default async function CompanyLink({ params }: { params: Promise<{ id: string; rest?: string[] }> }) {
  const { id, rest } = await params;
  const section = rest?.[0];
  if (section === 'deadlines') redirect(`/deadlines?company=${encodeURIComponent(id)}`);
  redirect((section ? TARGETS[section] : undefined) ?? `/company/${encodeURIComponent(id)}`);
}
