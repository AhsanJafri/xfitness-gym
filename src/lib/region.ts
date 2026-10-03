import * as Location from 'expo-location';
import type { Country } from '@/lib/i18n';

function countryFromTimezone(): Country {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (zone === 'Asia/Karachi') return 'PK';
  if (zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta') return 'IN';
  return null;
}

export async function detectCountry(): Promise<Country> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') return countryFromTimezone();
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    const places = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    const code = places[0]?.isoCountryCode;
    if (code === 'PK' || code === 'IN') return code;
  } catch {
    return countryFromTimezone();
  }
  return countryFromTimezone();
}
