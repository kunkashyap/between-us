import * as Location from 'expo-location';

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Request location permission strictly when invoked by user action.
 */
export async function requestCurrentLocation(): Promise<LocationResult | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = loc.coords;

    // Reverse geocode to get human-friendly place name
    let name = 'Unknown Location';
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places && places.length > 0) {
        const place = places[0];
        const parts: string[] = [];
        if (place.name && !place.name.match(/^\d+$/)) parts.push(place.name);
        else if (place.street) parts.push(place.street);

        if (place.district || place.subregion) {
          parts.push(place.district || place.subregion || '');
        }
        if (place.city) parts.push(place.city);
        else if (place.region) parts.push(place.region);

        const filtered = parts.filter(Boolean);
        if (filtered.length > 0) {
          name = filtered.slice(0, 2).join(', ');
        }
      }
    } catch {
      name = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    }

    return {
      name,
      latitude,
      longitude,
    };
  } catch (err) {
    console.warn('Error fetching location:', err);
    return null;
  }
}
