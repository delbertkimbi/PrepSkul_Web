import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrDeny } from '../../analytics/_lib';

export const runtime = 'nodejs';

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const limit = Math.min(Number(searchParams.get('limit') || 200), 500);
    const format = searchParams.get('format') || 'json';

    let dbQuery = supabaseAdmin
      .from('admin_operational_events')
      .select('id, event_type, subject, payload, emails_sent, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type !== 'all') {
      dbQuery = dbQuery.eq('event_type', type);
    }

    const { data, error } = await dbQuery;
    if (error) throw error;

    let rows = data || [];
    if (query) {
      rows = rows.filter((r: any) => {
        const hay = `${r.event_type || ''} ${r.subject || ''} ${JSON.stringify(r.payload || {})}`.toLowerCase();
        return hay.includes(query);
      });
    }

    const eventTypes = [...new Set((data || []).map((r: any) => r.event_type).filter(Boolean))].sort();

    if (format === 'csv') {
      const header = [
        'id',
        'created_at',
        'event_type',
        'subject',
        'emails_sent',
        'payload',
      ];
      const lines = rows.map((r: any) =>
        [
          csvCell(r.id),
          csvCell(r.created_at),
          csvCell(r.event_type),
          csvCell(r.subject || ''),
          csvCell(Array.isArray(r.emails_sent) ? r.emails_sent.join('; ') : ''),
          csvCell(JSON.stringify(r.payload || {})),
        ].join(',')
      );
      const csv = [header.join(','), ...lines].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="ops-events-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      rows,
      filters: { eventTypes },
      totals: {
        count: rows.length,
        withEmails: rows.filter((r: any) => Array.isArray(r.emails_sent) && r.emails_sent.length > 0).length,
      },
    });
  } catch (error: any) {
    console.error('admin operations events error', error);
    return NextResponse.json({ error: error?.message || 'Failed to load operational events' }, { status: 500 });
  }
}

