"""
Destination Service — provides robust destination normalization, alias mapping,
and fuzzy matching for worldwide locations (cities, countries, regions).
"""
import re

ALIAS_MAP = {
    # US / North America
    "nyc": "New York City",
    "new york": "New York City",
    "ny": "New York City",
    "us": "New York City",
    "usa": "New York City",
    "america": "New York City",
    "united states": "New York City",
    "sf": "San Francisco",
    "la": "Los Angeles",
    "washington": "Washington, D.C.",
    "washington dc": "Washington, D.C.",

    # Middle East
    "uae": "Dubai",
    "united arab emirates": "Dubai",
    "abu dhabi": "Abu Dhabi",
    "ksa": "Riyadh",
    "saudi arabia": "Riyadh",

    # UK / Europe
    "uk": "London",
    "united kingdom": "London",
    "gb": "London",
    "great britain": "London",
    "england": "London",
    "fr": "Paris",
    "france": "Paris",
    "es": "Madrid",
    "spain": "Madrid",
    "it": "Rome",
    "italy": "Rome",
    "de": "Berlin",
    "germany": "Berlin",
    "nl": "Amsterdam",
    "netherlands": "Amsterdam",
    "holland": "Amsterdam",
    "switzerland": "Zurich",

    # Asia
    "jp": "Tokyo",
    "japan": "Tokyo",
    "cn": "Beijing",
    "china": "Beijing",
    "kr": "Seoul",
    "korea": "Seoul",
    "south korea": "Seoul",
    "sg": "Singapore",
    "th": "Bangkok",
    "thailand": "Bangkok",
    "in": "New Delhi",
    "india": "New Delhi",
    "delhi": "New Delhi",
    "pk": "Pakistan",
    "pakistan": "Pakistan",
    "swat": "Swat",
    "swat valley": "Swat",
    "kalam": "Swat",

    # Oceania
    "au": "Sydney",
    "australia": "Sydney",
    "nz": "Auckland",
    "new zealand": "Auckland",
}

def normalize_destination(destination_input: str) -> str:
    """
    Clean, normalize, and resolve common country/region aliases to canonical destination titles.
    """
    if not destination_input:
        return "Unknown"
        
    s = destination_input.lower().strip()
    s = re.sub(r"[^\w\s\-\,\.]", "", s) # Clean unicode noise but preserve spaces/hyphens
    
    # Check exact match in alias map
    if s in ALIAS_MAP:
        return ALIAS_MAP[s]
        
    # Check if alias is part of input (e.g. "london, uk" -> "London")
    parts = [p.strip() for p in s.split(",") if p.strip()]
    if parts:
        first_part = parts[0]
        if first_part in ALIAS_MAP:
            return ALIAS_MAP[first_part]
        return first_part.title()
        
    return destination_input.strip().title()
