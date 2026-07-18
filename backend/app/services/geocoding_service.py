import httpx
import logging
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

class GeocodingService:
    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.headers = {
            "User-Agent": "SharePlate/1.0 (Development Demo)"
        }
        self.timeout = 10.0

    def geocode(self, address: str) -> Optional[Tuple[float, float]]:
        address = address.strip()
        if not address:
            return None

        # Attempt 1: Exact address with India country code restriction
        coords = self._fetch_coords(address)
        if coords:
            return coords

        # Attempt 2: Fallback for short/ambiguous addresses
        # A simple conservative rule: If the address has no commas and is less than 3 words,
        # it might be a local area like "MP Nagar" or "Arera Colony".
        # We append ", Bhopal, Madhya Pradesh, India" as a fallback.
        parts = [p.strip() for p in address.split(',')]
        words = address.split()
        if len(parts) == 1 and len(words) <= 3:
            fallback_address = f"{address}, Bhopal, Madhya Pradesh, India"
            logger.info(f"First geocoding attempt failed for '{address}'. Trying fallback: '{fallback_address}'")
            return self._fetch_coords(fallback_address)

        return None

    def _fetch_coords(self, search_query: str) -> Optional[Tuple[float, float]]:
        params = {
            "q": search_query,
            "format": "json",
            "limit": 1,
            "countrycodes": "in"
        }
        try:
            with httpx.Client(timeout=self.timeout, headers=self.headers) as client:
                response = client.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()

                if data and len(data) > 0:
                    lat_str = data[0].get("lat")
                    lon_str = data[0].get("lon")

                    if lat_str is not None and lon_str is not None:
                        lat = float(lat_str)
                        lon = float(lon_str)

                        # Validate coordinates
                        if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
                            return (lat, lon)
                        else:
                            logger.warning(f"Invalid coordinates returned for {search_query}: {lat}, {lon}")
                return None
        except httpx.HTTPError as e:
            logger.error(f"Geocoding HTTP error for {search_query}: {e}")
            return None
        except ValueError as e:
            logger.error(f"Geocoding parsing/value error for {search_query}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected geocoding error for {search_query}: {e}")
            return None
