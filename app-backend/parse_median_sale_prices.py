import pandas as pd
import json
import os
from typing import Dict, List

# Property type file mapping - USE EXCEL FILES
PROPERTY_FILES = {
    'all': 'med_sale_price.xlsx',
    'single_family': 'med_sale_price_single.xlsx',
    'townhouse': 'med_sale_price_townhouse.xlsx',
    'condo': 'med_sale_price_condo.xlsx'
}

def parse_median_prices(file_path: str, property_type: str = 'all') -> List[Dict]:
    """
    Parse the median sale price Excel file and return average/latest prices per region.
    
    Args:
        file_path: Path to the Excel file
        property_type: Type of property (all, single_family, townhouse, condo)
    
    Returns:
        List of dictionaries with price statistics per region
    """
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Could not find {file_path}")
    
    print(f"📂 Reading {property_type} data from: {file_path}")
    
    try:
        # Read Excel file - header=1 means use row 1 as column names (skips row 0)
        df = pd.read_excel(file_path, header=1)
        
        print(f"   📋 Columns found: {len(df.columns)}")
        print(f"   📋 First column: '{df.columns[0]}'")
        print(f"   📋 Rows loaded: {len(df)}")
        
    except Exception as e:
        print(f"   ❌ Error reading file: {e}")
        raise
    
    # Verify we got the data correctly
    if len(df.columns) < 2 or len(df) == 0:
        raise Exception(f"Excel file appears empty or malformed. Columns: {len(df.columns)}, Rows: {len(df)}")
    
    print(f"✅ Loaded {len(df)} regions")
    print(f"📊 Time periods: {len(df.columns) - 1}")
    
    # First column is 'Region', rest are dates
    region_col = df.columns[0]
    date_columns = df.columns[1:]
    
    results = []
    
    for idx, row in df.iterrows():
        region = row[region_col]
        
        # Skip if region is NaN or empty
        if pd.isna(region) or str(region).strip() == '':
            continue
        
        # Get all price values for this region
        prices = row[date_columns]
        
        # Convert prices - they're already numeric in Excel
        numeric_prices = []
        for price in prices:
            if pd.notna(price) and price != '':
                try:
                    # Excel stores numbers directly, just convert to float
                    numeric_value = float(price)
                    numeric_prices.append(numeric_value)
                except (ValueError, TypeError):
                    # Skip invalid values
                    pass
        
        if numeric_prices:
            avg_price = sum(numeric_prices) / len(numeric_prices)
            latest_price = numeric_prices[-1]
            min_price = min(numeric_prices)
            max_price = max(numeric_prices)
            
            results.append({
                'region': region,
                'property_type': property_type,
                'average_price': round(avg_price, 2),
                'latest_price': round(latest_price, 2),
                'min_price': round(min_price, 2),
                'max_price': round(max_price, 2),
                'price_range': f"${min_price/1000:.0f}K - ${max_price/1000:.0f}K",
                'data_points': len(numeric_prices)
            })
    
    print(f"   ✅ Processed {property_type}: {len(results)} regions")
    return results


def parse_all_property_types() -> Dict[str, List[Dict]]:
    """
    Parse all available property type files and return combined results.
    
    Returns:
        Dictionary with property types as keys and results as values
    """
    all_results = {}
    
    # Show current directory
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"📁 Files in directory: {[f for f in os.listdir('.') if f.endswith('.xlsx')]}\n")
    
    for prop_type, filename in PROPERTY_FILES.items():
        print(f"🔍 Looking for {prop_type}: {filename}")
        
        if os.path.exists(filename):
            print(f"   ✅ Found: {filename}")
            try:
                results = parse_median_prices(filename, prop_type)
                all_results[prop_type] = results
            except Exception as e:
                print(f"   ⚠️  Could not process {prop_type}: {e}\n")
                import traceback
                traceback.print_exc()
        else:
            print(f"   ❌ File not found: {filename}\n")
    
    return all_results


def organize_by_region(all_results: Dict[str, List[Dict]]) -> Dict[str, Dict]:
    """
    Reorganize data by region, with property types nested under each region.
    
    Returns:
        Dictionary with regions as keys, property types nested inside
    """
    organized = {}
    
    for prop_type, results in all_results.items():
        for result in results:
            region = result['region']
            
            if region not in organized:
                organized[region] = {
                    'region': region,
                    'property_types': {}
                }
            
            organized[region]['property_types'][prop_type] = {
                'average_price': result['average_price'],
                'latest_price': result['latest_price'],
                'min_price': result['min_price'],
                'max_price': result['max_price'],
                'price_range': result['price_range'],
                'data_points': result['data_points']
            }
    
    return organized


def print_results_by_property_type(all_results: Dict[str, List[Dict]]):
    """Pretty print results organized by property type"""
    print("\n" + "="*80)
    print("FLORIDA HOUSING PRICES BY PROPERTY TYPE")
    print("="*80)
    
    for prop_type, results in all_results.items():
        print(f"\n{'='*80}")
        print(f"PROPERTY TYPE: {prop_type.upper().replace('_', ' ')}")
        print(f"{'='*80}")
        
        for result in results:
            print(f"\n📍 {result['region']}")
            print(f"   Average Price: ${result['average_price']:,.0f}")
            print(f"   Latest Price:  ${result['latest_price']:,.0f}")
            print(f"   Price Range:   {result['price_range']}")


def print_results_by_region(organized: Dict[str, Dict]):
    """Pretty print results organized by region"""
    print("\n" + "="*80)
    print("FLORIDA HOUSING PRICES BY REGION")
    print("="*80)
    
    for region, data in organized.items():
        print(f"\n{'='*80}")
        print(f"📍 {region}")
        print(f"{'='*80}")
        
        for prop_type, prices in data['property_types'].items():
            print(f"\n  {prop_type.upper().replace('_', ' ')}:")
            print(f"    Average Price: ${prices['average_price']:,.0f}")
            print(f"    Latest Price:  ${prices['latest_price']:,.0f}")
            print(f"    Price Range:   {prices['price_range']}")


def save_results(all_results: Dict, organized: Dict):
    """Save results to JSON files"""
    
    # Save by property type
    with open('florida_housing_by_property_type.json', 'w') as f:
        json.dump(all_results, f, indent=2)
    print(f"\n💾 Saved results to florida_housing_by_property_type.json")
    
    # Save by region
    with open('florida_housing_by_region.json', 'w') as f:
        json.dump(organized, f, indent=2)
    print(f"💾 Saved results to florida_housing_by_region.json")


def main():
    try:
        print("="*80)
        print("FLORIDA HOUSING PRICE ANALYZER")
        print("="*80)
        print()
        
        # Parse all property types
        all_results = parse_all_property_types()
        
        if not all_results:
            print("❌ No data files found!")
            return
        
        # Organize by region
        organized = organize_by_region(all_results)
        
        # Print results both ways
        print_results_by_property_type(all_results)
        print_results_by_region(organized)
        
        # Save to JSON
        save_results(all_results, organized)
        
        # Quick comparison summary
        print("\n" + "="*80)
        print("LATEST PRICE COMPARISON (All Property Types)")
        print("="*80)
        
        for region in sorted(organized.keys()):
            print(f"\n{region}:")
            prop_types = organized[region]['property_types']
            for prop_type in ['all', 'single_family', 'townhouse', 'condo']:
                if prop_type in prop_types:
                    price = prop_types[prop_type]['latest_price']
                    print(f"  {prop_type.replace('_', ' ').title():20s} ${price:>12,.0f}")
        
        print("\n✅ Processing complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()