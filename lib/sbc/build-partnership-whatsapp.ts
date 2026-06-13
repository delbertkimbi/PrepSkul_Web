import {
  SBC_PARTNERSHIP_INTERESTS,
  SBC_PARTNERSHIP_ORG_TYPES,
} from "@/lib/sbc/content"

export interface PartnershipWhatsAppPayload {
  contact_name: string
  phone: string
  email: string
  city: string
  country: string
  website: string
  organization_name: string
  org_type: string
  org_type_other: string
  partnership_interests: string[]
  interests_other: string
  about: string
  proposal: string
  investment_range: string
}

function getOrgTypeLabel(value: string, other: string) {
  if (value === "other") return other.trim()
  return SBC_PARTNERSHIP_ORG_TYPES.find((t) => t.value === value)?.label ?? value
}

function formatInterestList(values: string[], otherDetail: string) {
  const lines = values.map((value, index) => {
    const label =
      SBC_PARTNERSHIP_INTERESTS.find((i) => i.value === value)?.label ?? value
    if (value === "other" && otherDetail.trim()) {
      return `${index + 1}. ${label}: ${otherDetail.trim()}`
    }
    return `${index + 1}. ${label}`
  })
  return lines.join("\n")
}

function field(value: string, fallback = "Not provided") {
  const trimmed = value.trim()
  return trimmed || fallback
}

export function buildPartnershipWhatsAppMessage(data: PartnershipWhatsAppPayload) {
  const orgType = getOrgTypeLabel(data.org_type, data.org_type_other)
  const isIndividual = data.org_type === "individual"
  const location = [data.city.trim(), data.country.trim()].filter(Boolean).join(", ")

  const sections = [
    "━━━━━━━━━━━━━━━━━━━━",
    "*SUMMER BUILD CAMP*",
    "*PARTNERSHIP INQUIRY*",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "*Source:* sbc.prepskul.com/partner",
    "*Organizers:* PrepSkul & DelTech Hub",
    "",
    "────────────────────",
    "*CONTACT INFORMATION*",
    "────────────────────",
    `*Name:* ${field(data.contact_name)}`,
    `*Phone / WhatsApp:* ${field(data.phone)}`,
    `*Email:* ${field(data.email)}`,
    `*Location:* ${field(location)}`,
    `*Website / LinkedIn:* ${field(data.website)}`,
    "",
    "────────────────────",
    "*ORGANIZATION*",
    "────────────────────",
    isIndividual
      ? `*Profile:* Individual / Angel Backer`
      : `*Organization:* ${field(data.organization_name)}`,
    `*Type:* ${orgType}`,
    "",
    "*About:*",
    field(data.about),
    "",
    "────────────────────",
    "*PARTNERSHIP INTERESTS*",
    "────────────────────",
    formatInterestList(data.partnership_interests, data.interests_other),
  ]

  if (data.investment_range.trim()) {
    sections.push(
      "",
      "────────────────────",
      "*ESTIMATED INVESTMENT / SUPPORT*",
      "────────────────────",
      data.investment_range.trim()
    )
  }

  sections.push(
    "",
    "────────────────────",
    "*PARTNERSHIP PROPOSAL*",
    "────────────────────",
    field(data.proposal),
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "Please review and follow up with this partner.",
    "━━━━━━━━━━━━━━━━━━━━"
  )

  return sections.join("\n")
}
