import os
import pandas as pd
from functools import lru_cache

# --- fast test knobs (env-driven) ---
FAST_TEST = os.getenv("REDFIN_FAST", "0") == "1"  # Changed default to "0" to load full dataset
NROWS = int(os.getenv("REDFIN_NROWS", "50000"))   # Only used if FAST_TEST=1

# New Redfin S3 gzip TSV link
RED_FIN_CITY_URL = (
    "https://redfin-public-data.s3.us-west-2.amazonaws.com/"
    "redfin_market_tracker/city_market_tracker.tsv000.gz"
)

@lru_cache(maxsize=1)
def load_fl_latest() -> pd.DataFrame:
    """
    Load Redfin city tracker (gzip TSV) directly from S3,
    filter to FL cities, keep the latest period per city,
    and return a tidy DataFrame for the API.
    """

    override = os.getenv("REDFIN_TSV_PATH")
    src = override if (override and os.path.exists(override)) else RED_FIN_CITY_URL

    CACHE_PATH = "data/cache/redfin_city_latest.tsv"
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)

    if os.path.exists(CACHE_PATH):
        print("⚙️  Loading cached Redfin data from local file...", flush=True)
        df = pd.read_csv(CACHE_PATH, sep="\t", low_memory=False)
        print(f"✅ Loaded {len(df):,} rows from cache", flush=True)
    else:
        print(f"🌐 Downloading from Redfin data source (limit: {NROWS if FAST_TEST else 'ALL'} rows)...", flush=True)
        
        # Load with row limit if in fast mode
        df = pd.read_csv(
            src,
            sep="\t",
            compression=("gzip" if str(src).endswith(".gz") else "infer"),
            low_memory=False,
            nrows=(NROWS if FAST_TEST else None),
        )
        
        print(f"✅ Loaded {len(df):,} rows from Redfin data", flush=True)
        
        # Print available columns for debugging
        print(f"📋 Available columns: {list(df.columns)[:10]}{'...' if len(df.columns) > 10 else ''}", flush=True)
        
        # Cache the downloaded data
        df.to_csv(CACHE_PATH, sep="\t", index=False)
        print(f"💾 Cached a local copy at {CACHE_PATH}", flush=True)

    # Normalize column names to handle potential variations
    df.columns = df.columns.str.lower().str.strip()
    
    # Check for required columns with flexible matching
    required_mapping = {
        'city': ['city', 'city_name'],
        'state': ['state', 'state_code'],
        'region_type': ['region_type', 'region type', 'regiontype'],
        'period_end': ['period_end', 'period end', 'periodend', 'date'],
        'median_list_price': ['median_list_price', 'median list price', 'median_sale_price'],
        'active_listings': ['active_listings', 'active listings', 'inventory'],
    }
    
    # Find actual column names
    col_map = {}
    for standard_name, possible_names in required_mapping.items():
        for possible in possible_names:
            if possible in df.columns:
                col_map[possible] = standard_name
                break
    
    # Rename columns to standard names
    df = df.rename(columns=col_map)
    
    print(f"🔍 Filtering for Florida cities...", flush=True)
    
    # Filter only Florida cities
    if 'state' in df.columns and 'region_type' in df.columns:
        df = df[(df["state"].str.upper() == "FL") & (df["region_type"].str.lower() == "city")].copy()
    elif 'state' in df.columns:
        df = df[df["state"].str.upper() == "FL"].copy()
    else:
        print("⚠️  Warning: Could not filter by state, returning all rows", flush=True)

    print(f"✅ Found {len(df):,} Florida city records", flush=True)

    # Get latest period per city
    if 'period_end' in df.columns and 'city' in df.columns:
        df['period_end'] = pd.to_datetime(df['period_end'], errors='coerce')
        df = df.sort_values('period_end').groupby('city', as_index=False).last()
        print(f"✅ Reduced to {len(df):,} unique Florida cities (latest period only)", flush=True)

    # Calculate YoY and MoM changes if not present
    for col in ['median_list_price_yoy', 'median_list_price_mom']:
        if col not in df.columns:
            df[col] = None

    # Clean up columns for output
    keep = [
        "city", "state", "period_end",
        "median_list_price", "active_listings",
        "median_list_price_yoy", "median_list_price_mom",
    ]
    keep = [c for c in keep if c in df.columns]

    df = df[keep].rename(columns={
        "median_list_price": "for_sale_median_list_price",
        "active_listings": "for_sale_inventory",
    })

    df["city_norm"] = df["city"].str.lower().str.strip()
    return df.reset_index(drop=True)


# ---------- Helper Functions ----------

def list_cities() -> list[str]:
    """Return all unique Florida city names in alphabetical order."""
    return sorted(load_fl_latest()["city"].unique().tolist())


def get_city_row(name: str) -> dict | None:
    """Return latest metrics for a specific city (case-insensitive)."""
    df = load_fl_latest()
    hit = df[df["city_norm"] == name.lower().strip()]
    if hit.empty:
        return None

    row = hit.iloc[0].to_dict()
    if "period_end" in row and pd.notna(row["period_end"]):
        row["period_end"] = pd.to_datetime(row["period_end"]).date().isoformat()
    return row