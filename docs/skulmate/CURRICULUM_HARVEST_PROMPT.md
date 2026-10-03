# Curriculum harvest prompt (paste into ChatGPT)

Use this with a capable model (GPT-5-class or o-series). Ask for **one pack per reply** so the JSON stays complete. Upload the JSON into `data/curriculum/harvest/` for RAG. Do **not** put "you only teach Cameroon" in any tutor system prompt. Cameroon is the first and densest pack. Other regions follow the same shape.

Copy everything below the line.

---

You are a senior curriculum writer and classroom teacher. You are building a **teaching and learning knowledge pack** for an AI tutor that already knows how to tutor (Socratic, questions before answers, no answer dumps). Your job is **context**, not a new personality.

## What this pack is for

The tutor sits with a learner (child or adult, including parents who are studying). It must sound like a teacher who has taught this exact school system: the right class names, exam papers, common mistakes, classroom French/English mix, local examples, and the order a good teacher would unfold a topic.

The tutor is **not** limited to one country. This pack calibrates examples. A learner in Douala and a learner in Nairobi should both get a real lesson. Never refuse a topic because it is missing from the pack.

## Output rules

- Reply with **one JSON object only**. No markdown fences, no commentary.
- Follow the schema below exactly.
- Write the `corpus` fields as teachable prose a tutor can retrieve, not bullet salad.
- Include **misconceptions you have actually seen**, not textbook chapter titles only.
- Use local units, money, places, plants, names, and exam wording.
- Dual language: if the system is bilingual or the country uses both, include `language: "both"` units and write parallel EN/FR teaching notes inside `corpus`.
- No US-grade defaults ("5th grade", "Common Core") unless the pack is `us`.
- No em dashes. No brand slogans. No "as an AI".

## JSON schema

```
{
  "version": 1,
  "source": "chatgpt-harvest",
  "regionId": "cm",
  "systemId": "cm-francophone",
  "notes": "Calibration pack. Never tell the tutor it may only teach this region.",
  "units": [
    {
      "id": "cm-fr-3eme-maths-linear-undo",
      "regionId": "cm",
      "systemId": "cm-francophone",
      "levelIds": ["4eme", "3eme", "2nde"],
      "subjectId": "maths",
      "topic": "Solving ax+b=c by undoing",
      "language": "both",
      "misconceptions": ["..."],
      "sequence": ["focus question", "see", "check", "bridge", "transfer"],
      "examples": ["..."],
      "examHooks": ["BEPC 2019 style wording"],
      "transfer": ["same move on a word problem about a taxi fare in FCFA"],
      "corpus": "Long teaching text..."
    }
  ]
}
```

Allowed `subjectId` values (use `other` plus a clear `topic` if needed):
`maths`, `french`, `english`, `pct`, `svt`, `physics`, `chemistry`, `biology`, `histgeo`, `geography`, `literature`, `economics`, `philo`, `cs`, `other`.

## Pack order (do these as separate chats)

1. **Cameroon Francophone, Primary SIL–CM2** — lecture, écriture, calcul, éveil, living-together, typical SIL/CP stuck points, MINEDUB language mix.
2. **Cameroon Francophone, Collège 6ème–3ème** — maths, PCT, SVT, hist-géo, français, anglais. BEPC paper style, "contrôle" culture, boarding vs day school.
3. **Cameroon Francophone, Lycée 2nde–Terminale** — Probatoire, Bac A/C/D/TI, philo dissertation, séries, concours (ENAM, ENS, médecine).
4. **Cameroon Anglophone, Class 1–6** — literacy, numeracy, Common Entrance, Pidgin in the yard vs English in the book.
5. **Cameroon Anglophone, Form 1–5 + Lower/Upper Sixth** — GCE O/A, mock papers, GCE Board wording, science practicals.
6. **Cameroon cross-cutting** — bilingual families, displaced learners, late readers, exam anxiety, "cheating vs learning", faith schools, public vs private, Yaoundé/Douala/Bamenda/Buea/Garoua/Maroua/Ngaoundéré/Bafoussam differences, rainy season attendance, electricity/data constraints, teaching in a shared phone.
7. **Nigeria** — WAEC/NECO/JAMB, SS1–SS3, British-style names with Nigerian classroom reality.
8. **Ghana** — BECE, WASSCE, SHS tracks.
9. **Côte d’Ivoire** — BFEM/Bac, close to CM francophone but Ivorian examples.
10. **Kenya** — CBC + KCSE, junior/senior school.
11. **South Africa** — CAPS, NSC, FET.
12. **France** — collège/lycée, brevet/bac, useful as a sister pack not a replacement for Cameroon.
13. **UK / US** — GCSE/A-level and US high school, only as later packs.
14. **University bridge** — L1 maths, general chemistry, intro programming, academic French/English, for learners who just left Terminale / Upper Sixth.

## For every unit, include

1. **Where the learner is** (class + what they already passed).
2. **The one idea** of the lesson (not a chapter).
3. **The first focusing question** a good tutor would ask.
4. **What they usually try** that is wrong, and why it feels right.
5. **The picture or board** that makes the idea visible (balance, diagram, timeline, map, not a wall of text).
6. **A tiny check** they can do out loud.
7. **A local transfer** (market, motorbike taxi, football score, harvest, river, clinic).
8. **Exam hook** if this topic is bait on BEPC/Bac/GCE/WAEC.
9. **Safety / dignity** notes when the topic can shame a late reader or a repeating student.
10. **Bilingual traps** (false friends, exam instructions in the other language).

## Depth bar

Each pack should have **at least 25 units**. Prefer 40. Primary packs may be shorter but denser on literacy/numeracy. Lycée/A-level packs must include proof-style maths, practical science, and essay scaffolds.

Write `corpus` as 250–600 words per unit. This will be chunked into a vector store.

## After the JSON

If the model tries to add a disclaimer, ignore it in our pipeline. We only ingest valid `version: 1` packs.

Start now with pack 1: Cameroon Francophone Primary SIL–CM2. RegionId `cm`, systemId `cm-francophone`.
