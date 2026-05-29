from __future__ import annotations

from itertools import cycle

FAMILY_BLUEPRINTS = [
    {
        'slug': 'overview',
        'title': 'Overview',
        'symbol': 'compass',
        'question': 'What is the shape of the market right now?',
        'highlight': 'A living snapshot that blends commerce, trust, motion, and price energy.',
    },
    {
        'slug': 'signals',
        'title': 'Signals',
        'symbol': 'pulse',
        'question': 'Which movements are quietly becoming trends?',
        'highlight': 'Short-horizon signals that highlight pressure, release, and momentum.',
    },
    {
        'slug': 'rituals',
        'title': 'Rituals',
        'symbol': 'lighthouse',
        'question': 'What repeatable habits improve outcomes?',
        'highlight': 'Guided routines that turn scattered tasks into dependable market practice.',
    },
    {
        'slug': 'archetypes',
        'title': 'Archetypes',
        'symbol': 'mosaic',
        'question': 'Which vendor and buyer patterns keep appearing?',
        'highlight': 'Character profiles that help teams understand recurring behavior.',
    },
    {
        'slug': 'trends',
        'title': 'Trends',
        'symbol': 'river',
        'question': 'How is the market evolving over time?',
        'highlight': 'Trend layers for seasonality, drift, and local variation.',
    },
    {
        'slug': 'forecasts',
        'title': 'Forecasts',
        'symbol': 'forecast',
        'question': 'Where is the market likely to move next?',
        'highlight': 'Probabilistic outlooks grounded in recent activity and trend direction.',
    },
    {
        'slug': 'benchmarks',
        'title': 'Benchmarks',
        'symbol': 'scale',
        'question': 'What baseline should the system compare itself against?',
        'highlight': 'Reference points for healthy, average, and exceptional performance.',
    },
    {
        'slug': 'comparisons',
        'title': 'Comparisons',
        'symbol': 'split',
        'question': 'How do two areas, items, or vendors differ?',
        'highlight': 'Side-by-side contrasts that make tradeoffs obvious at a glance.',
    },
    {
        'slug': 'maps',
        'title': 'Maps',
        'symbol': 'grid',
        'question': 'Where do market behaviors cluster geographically?',
        'highlight': 'Regional views that translate raw location data into spatial context.',
    },
    {
        'slug': 'scores',
        'title': 'Scores',
        'symbol': 'meter',
        'question': 'How healthy or resilient is a given slice of the market?',
        'highlight': 'Composite scores that combine activity, consistency, and trust signals.',
    },
    {
        'slug': 'chronicles',
        'title': 'Chronicles',
        'symbol': 'scroll',
        'question': 'What story does the market tell when the data is read in sequence?',
        'highlight': 'Narrative summaries that stitch together observations into a readable arc.',
    },
    {
        'slug': 'experiments',
        'title': 'Experiments',
        'symbol': 'spark',
        'question': 'Which ideas are worth testing next?',
        'highlight': 'Low-risk experiment templates for changing assumptions safely.',
    },
    {
        'slug': 'playbooks',
        'title': 'Playbooks',
        'symbol': 'manual',
        'question': 'What should a team do when a pattern appears?',
        'highlight': 'Action bundles that pair insight with a recommended next step.',
    },
]

MOODS = [
    'clear-sky',
    'dust-trail',
    'early-rain',
    'market-bell',
    'evening-glow',
    'open-road',
    'quiet-harbor',
    'stone-lamp',
    'signal-flare',
    'woven-path',
    'orchard-breeze',
    'ember-line',
]

MOTIFS = [
    'trust',
    'price',
    'density',
    'seasonality',
    'latency',
    'basket-size',
    'basket-shape',
    'inventory',
    'footfall',
    'repeat-rate',
    'reliability',
    'fairness',
]

REGIONS = [
    'north-arc',
    'south-arc',
    'central-belt',
    'east-line',
    'west-line',
    'river-market',
    'highland-trail',
    'coastal-ring',
    'upland-hub',
    'valley-corridor',
    'metro-loop',
    'garden-district',
]

ACTIONS = [
    'observe',
    'compare',
    'stabilize',
    'test',
    'forecast',
    'calibrate',
    'narrate',
    'publish',
    'expand',
    'review',
    'defend',
    'refine',
]


def build_family_cards() -> list[dict]:
    cards: list[dict] = []
    mood_cycle = cycle(MOODS)
    motif_cycle = cycle(MOTIFS)
    region_cycle = cycle(REGIONS)
    action_cycle = cycle(ACTIONS)

    for family_index, family in enumerate(FAMILY_BLUEPRINTS, start=1):
        for slot in range(1, 11):
            mood = next(mood_cycle)
            motif = next(motif_cycle)
            region = next(region_cycle)
            action = next(action_cycle)
            cards.append(
                {
                    'family': family['slug'],
                    'key': f"{family['slug']}-{slot}",
                    'title': f"{family['title']} {slot}",
                    'summary': (
                        f"{family['question']} This card ties {motif} to {mood}"
                        f" conditions in the {region}."
                    ),
                    'detail': (
                        f"{family['highlight']} The recommended verb is {action},"
                        f" and the local tone is {mood}."
                    ),
                    'rank': family_index * 10 + slot,
                    'mood': mood,
                    'motif': motif,
                    'region': region,
                    'action': action,
                    'tags': [family['slug'], motif, region, mood],
                }
            )
    return cards


FAMILY_CARDS = build_family_cards()


def family_blueprint_map() -> dict[str, dict]:
    return {family['slug']: family for family in FAMILY_BLUEPRINTS}


def cards_for_family(family_slug: str) -> list[dict]:
    return [card for card in FAMILY_CARDS if card['family'] == family_slug]


def card_for_key(family_slug: str, key: str) -> dict | None:
    for card in FAMILY_CARDS:
        if card['family'] == family_slug and card['key'] == key:
            return card
    return None
