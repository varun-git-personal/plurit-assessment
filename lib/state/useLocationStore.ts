import { observable } from "@legendapp/state";
import * as Location from "expo-location";

interface LocationState {
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  address: string | null;
}

const _store = observable<LocationState>({
  isLoading: false,
  error: null,
  hasPermission: false,
  currentLocation: null,
  address: null,
});

export const useLocationStore = () => {
  const requestLocationPermission = async () => {
    try {
      _store.isLoading.set(true);
      _store.error.set(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      _store.hasPermission.set(status === "granted");

      if (status !== "granted") {
        _store.error.set("Permission to access location was denied");
        return false;
      }

      return true;
    } catch (error) {
      _store.error.set(
        error instanceof Error ? error.message : "Failed to request permission"
      );
      return false;
    } finally {
      _store.isLoading.set(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      _store.isLoading.set(true);
      _store.error.set(null);

      // Check if we already have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      _store.currentLocation.set({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const formattedAddress = [
          address.street,
          address.district,
          address.city,
          address.region,
        ]
          .filter(Boolean)
          .join(", ");
        _store.address.set(formattedAddress);
      }
    } catch (error) {
      _store.error.set(
        error instanceof Error ? error.message : "Failed to get location"
      );
    } finally {
      _store.isLoading.set(false);
    }
  };

  return {
    isLoading: _store.isLoading,
    error: _store.error,
    hasPermission: _store.hasPermission,
    currentLocation: _store.currentLocation,
    address: _store.address,
    requestLocationPermission,
    getCurrentLocation,
  } as const;
};
