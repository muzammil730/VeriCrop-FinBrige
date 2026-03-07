"""
VeriCrop FinBridge - Solar Azimuth Calculator
Calculates expected shadow angle using physics formula to detect fraud
Formula: sin α = sin Φ sin δ + cos Φ cos δ cos h
"""

import json
import math
from datetime import datetime, timezone

def lambda_handler(event, context):
    """
    Input: GPS coordinates (lat, lon), timestamp, timezone
    Output: Expected solar azimuth angle in degrees
    """
    
    try:
        # Extract input from event
        latitude = float(event['latitude'])  # Φ (phi) in degrees
        longitude = float(event['longitude'])
        timestamp = event['timestamp']  # ISO 8601 format
        
        # Parse timestamp
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        # Calculate solar azimuth
        azimuth = calculate_solar_azimuth(latitude, longitude, dt)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'azimuth': azimuth,
                'latitude': latitude,
                'longitude': longitude,
                'timestamp': timestamp,
                'message': f'Expected shadow angle: {azimuth:.2f}°'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to calculate solar azimuth'
            })
        }

def calculate_solar_azimuth(latitude, longitude, dt):
    """
    Calculate solar azimuth using astronomical formulas
    """
    # Convert latitude to radians
    lat_rad = math.radians(latitude)

    
    # Calculate day of year
    day_of_year = dt.timetuple().tm_yday
    
    # Calculate solar declination (δ) using Cooper's equation
    # δ = 23.45° × sin(360/365 × (284 + n))
    declination_deg = 23.45 * math.sin(math.radians((360/365) * (day_of_year + 284)))
    declination_rad = math.radians(declination_deg)
    
    # Calculate hour angle (h)
    # h = 15° × (solar_time - 12)
    # Solar time = UTC time + (longitude / 15)
    utc_hour = dt.hour + dt.minute/60 + dt.second/3600
    solar_time = utc_hour + (longitude / 15)
    hour_angle_deg = 15 * (solar_time - 12)
    hour_angle_rad = math.radians(hour_angle_deg)
    
    # Calculate solar altitude (α) using the formula:
    # sin(α) = sin(Φ) × sin(δ) + cos(Φ) × cos(δ) × cos(h)
    sin_altitude = (math.sin(lat_rad) * math.sin(declination_rad) + 
                    math.cos(lat_rad) * math.cos(declination_rad) * math.cos(hour_angle_rad))
    
    altitude_rad = math.asin(sin_altitude)
    altitude_deg = math.degrees(altitude_rad)
    
    # Calculate solar azimuth
    # cos(azimuth) = (sin(δ) - sin(α) × sin(Φ)) / (cos(α) × cos(Φ))
    cos_azimuth = ((math.sin(declination_rad) - sin_altitude * math.sin(lat_rad)) / 
                   (math.cos(altitude_rad) * math.cos(lat_rad)))
    
    # Clamp to [-1, 1] to avoid math domain errors
    cos_azimuth = max(-1, min(1, cos_azimuth))
    
    azimuth_rad = math.acos(cos_azimuth)
    azimuth_deg = math.degrees(azimuth_rad)
    
    # Adjust azimuth based on hour angle (morning vs afternoon)
    if hour_angle_deg > 0:  # Afternoon
        azimuth_deg = 360 - azimuth_deg
    
    return round(azimuth_deg, 2)

# Test locally
if __name__ == "__main__":
    # Test case: Mumbai coordinates at noon
    test_event = {
        'latitude': 19.0760,
        'longitude': 72.8777,
        'timestamp': '2026-03-01T12:00:00Z'
    }
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
