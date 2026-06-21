'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Request failed')
  }
  return res.json()
}

type InsightRow = {
  id: string
  title: string
  gameType: string
  sourceType: string
  createdAt: string
  curriculum: {
    mode: string
    confidence: number
    frameworkLabel: string | null
    matchedTopics: string[]
  } | null
  extraction: {
    level: string
    confidence: number
    flags: string[]
    method: string | null
  } | null
}

type RevisionPackage = {
  id: string
  title: string
  subtitle?: string
  credits: number
  amount_xaf: number
  original_amount_xaf?: number
  is_popular?: boolean
  sort_order?: number
  cta?: string
  benefits?: string[]
}

function badgeClass(tone: 'neutral' | 'warn' | 'ok' | 'info') {
  switch (tone) {
    case 'warn':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'ok':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'info':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

export default function SkulMateOpsClient() {
  const [tab, setTab] = useState<'insights' | 'weak' | 'parents' | 'pricing'>('insights')
  const [locale, setLocale] = useState<'en' | 'fr'>('en')
  const [quality, setQuality] = useState('all')
  const [alignment, setAlignment] = useState('all')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const insightsUrl = useMemo(() => {
    const params = new URLSearchParams()
    params.set('limit', '60')
    params.set('locale', locale)
    if (quality !== 'all') params.set('quality', quality)
    if (alignment !== 'all') params.set('alignment', alignment)
    return `/api/admin/skulmate/generation-insights?${params.toString()}`
  }, [locale, quality, alignment])

  const csvExportUrl = useMemo(() => {
    const params = new URLSearchParams(insightsUrl.split('?')[1] || '')
    params.set('format', 'csv')
    return `/api/admin/skulmate/generation-insights?${params.toString()}`
  }, [insightsUrl])

  const weakTopicsUrl = useMemo(
    () => `/api/admin/skulmate/weak-topics?limit=80&locale=${locale}`,
    [locale]
  )

  const parentProgressUrl = useMemo(
    () => `/api/admin/skulmate/parent-progress?locale=${locale}`,
    [locale]
  )

  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
    mutate: refreshInsights,
  } = useSWR(tab === 'insights' ? insightsUrl : null, fetcher, {
    refreshInterval: 30000,
  })

  const {
    data: parentData,
    isLoading: parentLoading,
    error: parentError,
    mutate: refreshParent,
  } = useSWR(tab === 'parents' ? parentProgressUrl : null, fetcher, {
    refreshInterval: 30000,
  })

  const {
    data: weakData,
    isLoading: weakLoading,
    error: weakError,
    mutate: refreshWeak,
  } = useSWR(tab === 'weak' ? weakTopicsUrl : null, fetcher, {
    refreshInterval: 30000,
  })

  const {
    data: pricingData,
    isLoading: pricingLoading,
    error: pricingError,
    mutate: refreshPricing,
  } = useSWR(tab === 'pricing' ? '/api/admin/skulmate/pricing' : null, fetcher)

  const [packages, setPackages] = useState<RevisionPackage[]>([])
  const [freeDoc, setFreeDoc] = useState(4)
  const [freeImage, setFreeImage] = useState(2)
  const [promoPercent, setPromoPercent] = useState(50)
  const [pricingInitialized, setPricingInitialized] = useState(false)

  useEffect(() => {
    if (!pricingData?.pricing || pricingInitialized) return
    const pricing = pricingData.pricing
    setPackages((pricing.revision_packages || []) as RevisionPackage[])
    setFreeDoc(Number(pricing.free_doc_text_games_per_day ?? 4))
    setFreeImage(Number(pricing.free_image_games_per_day ?? 2))
    setPromoPercent(Number(pricing.promo_discount_percent ?? 50))
    setPricingInitialized(true)
  }, [pricingData, pricingInitialized])

  const rows = (insightsData?.rows || []) as InsightRow[]

  const savePricing = async () => {
    setSaving(true)
    setSaveMessage(null)
    try {
      const res = await fetch('/api/admin/skulmate/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revision_packages: packages,
          free_doc_text_games_per_day: freeDoc,
          free_image_games_per_day: freeImage,
          promo_discount_percent: promoPercent,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Save failed')
      }
      setSaveMessage('Saved — mobile app picks up changes within ~5 minutes.')
      setPricingInitialized(false)
      refreshPricing()
    } catch (e: unknown) {
      setSaveMessage(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SkulMate Ops</h1>
          <p className="text-sm text-gray-600 mt-1">
            Internal generation QA and revision pricing. Not shown to learners.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              tab === 'insights'
                ? refreshInsights()
                : tab === 'weak'
                  ? refreshWeak()
                  : tab === 'parents'
                    ? refreshParent()
                    : refreshPricing()
            }
            className="border border-gray-300 px-3 py-2 text-sm font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-none"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['insights', 'weak', 'parents', 'pricing'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === key
                ? 'border-[#1B2C4F] text-[#1B2C4F]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {key === 'insights'
              ? 'Generation insights'
              : key === 'weak'
                ? 'Weak topics'
                : key === 'parents'
                  ? 'Parent progress'
                  : 'Revision packages'}
          </button>
        ))}
      </div>

      {tab === 'insights' && (
        <>
          <div className="bg-white border border-gray-200 rounded-none p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-gray-500">Recent games</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {insightsData?.totals?.count ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Low extraction QA</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {insightsData?.totals?.lowExtraction ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">School-aligned (internal)</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {insightsData?.totals?.schoolMatched ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Open learning</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {insightsData?.totals?.openCurriculum ?? '—'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={csvExportUrl}
              className="border border-gray-300 px-3 py-2 text-sm font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-none"
            >
              Export CSV
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={locale} onValueChange={(v) => setLocale(v as 'en' | 'fr')}>
              <SelectTrigger className="w-full sm:w-[160px] border-gray-300 rounded-none">
                <SelectValue placeholder="Labels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">Labels: English</SelectItem>
                <SelectItem value="fr">Labels: Français</SelectItem>
              </SelectContent>
            </Select>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-full sm:w-[200px] border-gray-300 rounded-none">
                <SelectValue placeholder="Extraction QA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All extraction levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={alignment} onValueChange={setAlignment}>
              <SelectTrigger className="w-full sm:w-[220px] border-gray-300 rounded-none">
                <SelectValue placeholder="Curriculum mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All curriculum modes</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="school_soft">School soft</SelectItem>
                <SelectItem value="school_matched">School matched</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {insightsLoading && (
            <p className="text-sm text-gray-500">Loading generation insights…</p>
          )}
          {insightsError && (
            <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 rounded-none">
              {insightsError.message}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-none overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Game</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Extraction QA</th>
                  <th className="px-3 py-2">Curriculum (internal)</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900">{row.title}</p>
                      <p className="text-xs text-gray-500">{row.gameType}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{row.sourceType}</td>
                    <td className="px-3 py-3">
                      {row.extraction ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-block border px-2 py-0.5 text-xs rounded-none ${badgeClass(
                              row.extraction.level === 'low'
                                ? 'warn'
                                : row.extraction.level === 'medium'
                                  ? 'info'
                                  : 'ok'
                            )}`}
                          >
                            {row.extraction.level} · {Math.round(row.extraction.confidence * 100)}%
                          </span>
                          {row.extraction.flags.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {row.extraction.flags.join(', ')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {row.curriculum ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-block border px-2 py-0.5 text-xs rounded-none ${badgeClass(
                              row.curriculum.mode === 'open' ? 'neutral' : 'info'
                            )}`}
                          >
                            {row.curriculum.mode}
                          </span>
                          {row.curriculum.frameworkLabel && (
                            <p className="text-xs text-gray-600">
                              {row.curriculum.frameworkLabel}
                            </p>
                          )}
                          {row.curriculum.matchedTopics.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {row.curriculum.matchedTopics.join(' · ')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!insightsLoading && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                      No games with generation context yet. Generate from the app after migration 098.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'weak' && (
        <>
          <div className="bg-white border border-gray-200 rounded-none p-4">
            <p className="text-xs text-gray-500">Learners needing reroute signal (Phase C)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {weakData?.totals?.weakTopics ?? '—'}
            </p>
          </div>

          <Select value={locale} onValueChange={(v) => setLocale(v as 'en' | 'fr')}>
            <SelectTrigger className="w-full sm:w-[160px] border-gray-300 rounded-none">
              <SelectValue placeholder="Labels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">Labels: English</SelectItem>
              <SelectItem value="fr">Labels: Français</SelectItem>
            </SelectContent>
          </Select>

          {weakLoading && (
            <p className="text-sm text-gray-500">Loading weak topics…</p>
          )}
          {weakError && (
            <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 rounded-none">
              {weakError.message}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-none overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2">Framework</th>
                  <th className="px-3 py-2">Mastery</th>
                  <th className="px-3 py-2">Weak streak</th>
                  <th className="px-3 py-2">Attempts</th>
                  <th className="px-3 py-2">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {(weakData?.rows || []).map((row: {
                  topicId: string
                  topicLabel: string
                  frameworkLabel: string | null
                  masteryScore: number
                  weakStreak: number
                  attempts: number
                  lastSeenAt: string
                }) => (
                  <tr key={`${row.topicId}-${row.lastSeenAt}`} className="border-t border-gray-100">
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900">{row.topicLabel}</p>
                      <p className="text-xs text-gray-500">{row.topicId}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {row.frameworkLabel ?? '—'}
                    </td>
                    <td className="px-3 py-3">
                      {Math.round(Number(row.masteryScore) * 100)}%
                    </td>
                    <td className="px-3 py-3">{row.weakStreak}</td>
                    <td className="px-3 py-3">{row.attempts}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(row.lastSeenAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {!weakLoading && (weakData?.rows || []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                      No weak topics yet. Apply migration 100 and complete games in the app.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'parents' && (
        <>
          <div className="bg-white border border-gray-200 rounded-none p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500">Children with activity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {parentData?.rows?.length ?? '—'}
              </p>
            </div>
          </div>

          <Select value={locale} onValueChange={(v) => setLocale(v as 'en' | 'fr')}>
            <SelectTrigger className="w-full sm:w-[160px] border-gray-300 rounded-none">
              <SelectValue placeholder="Labels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">Labels: English</SelectItem>
              <SelectItem value="fr">Labels: Français</SelectItem>
            </SelectContent>
          </Select>

          {parentLoading && (
            <p className="text-sm text-gray-500">Loading parent progress…</p>
          )}
          {parentError && (
            <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 rounded-none">
              {parentError.message}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-none overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Child</th>
                  <th className="px-3 py-2">Readiness</th>
                  <th className="px-3 py-2">Streak</th>
                  <th className="px-3 py-2">7d min</th>
                  <th className="px-3 py-2">Weak topics</th>
                </tr>
              </thead>
              <tbody>
                {(parentData?.rows || []).map((row: {
                  parentId: string
                  childId: string
                  childName: string
                  examReadiness: number
                  readinessLabel: string
                  streakDays: number
                  revisionMinutesLast7Days: number
                  weakTopics: Array<{ topicLabel: string }>
                }) => (
                  <tr key={row.childId} className="border-t border-gray-100 align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900">{row.childName}</p>
                      <p className="text-xs text-gray-500 font-mono">{row.childId}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-gray-900">
                        {row.examReadiness}%
                      </span>
                      <p className="text-xs text-gray-500">{row.readinessLabel}</p>
                    </td>
                    <td className="px-3 py-3">{row.streakDays}d</td>
                    <td className="px-3 py-3">{row.revisionMinutesLast7Days}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {row.weakTopics.length > 0
                        ? row.weakTopics.map((t) => t.topicLabel).join(' · ')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {!parentLoading && (parentData?.rows || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                      No parent-linked SkulMate activity yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'pricing' && (
        <>
          {pricingLoading && (
            <p className="text-sm text-gray-500">Loading SkulMate pricing…</p>
          )}
          {pricingError && (
            <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 rounded-none">
              {pricingError.message}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-none p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Free doc/text per day</label>
              <Input
                type="number"
                min={0}
                value={freeDoc}
                onChange={(e) => setFreeDoc(Number(e.target.value))}
                className="mt-1 border-gray-300 rounded-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Free images per day</label>
              <Input
                type="number"
                min={0}
                value={freeImage}
                onChange={(e) => setFreeImage(Number(e.target.value))}
                className="mt-1 border-gray-300 rounded-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Promo discount %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={promoPercent}
                onChange={(e) => setPromoPercent(Number(e.target.value))}
                className="mt-1 border-gray-300 rounded-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id || index}
                className="bg-white border border-gray-200 rounded-none p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <Input
                  value={pkg.title}
                  onChange={(e) => {
                    const next = [...packages]
                    next[index] = { ...pkg, title: e.target.value }
                    setPackages(next)
                  }}
                  placeholder="Title"
                  className="border-gray-300 rounded-none"
                />
                <Input
                  type="number"
                  value={pkg.credits}
                  onChange={(e) => {
                    const next = [...packages]
                    next[index] = { ...pkg, credits: Number(e.target.value) }
                    setPackages(next)
                  }}
                  placeholder="Credits"
                  className="border-gray-300 rounded-none"
                />
                <Input
                  type="number"
                  value={pkg.amount_xaf}
                  onChange={(e) => {
                    const next = [...packages]
                    next[index] = { ...pkg, amount_xaf: Number(e.target.value) }
                    setPackages(next)
                  }}
                  placeholder="Price XAF"
                  className="border-gray-300 rounded-none"
                />
                <Input
                  type="number"
                  value={pkg.original_amount_xaf ?? pkg.amount_xaf * 2}
                  onChange={(e) => {
                    const next = [...packages]
                    next[index] = {
                      ...pkg,
                      original_amount_xaf: Number(e.target.value),
                    }
                    setPackages(next)
                  }}
                  placeholder="Strikethrough XAF"
                  className="border-gray-300 rounded-none"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving || packages.length === 0}
              onClick={savePricing}
              className="bg-[#1B2C4F] text-white px-4 py-2 text-sm font-medium rounded-none disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save pricing'}
            </button>
            {saveMessage && (
              <p className="text-sm text-gray-600">{saveMessage}</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
