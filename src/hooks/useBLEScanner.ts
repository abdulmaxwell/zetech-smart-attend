import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface BeaconData {
  uuid: string;
  major?: number;
  minor?: number;
  rssi: number;
  distance?: number;
}

// Extend Navigator interface for Web Bluetooth
declare global {
  interface Navigator {
    bluetooth?: any;
  }
}

export const useBLEScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [nearbyBeacons, setNearbyBeacons] = useState<BeaconData[]>([]);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);

  useEffect(() => {
    // Check if Web Bluetooth API is supported
    setIsSupported('bluetooth' in navigator);
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      toast.error('Bluetooth not supported on this device');
      return;
    }

    try {
      setIsScanning(true);
      
      // Request Bluetooth device (simplified for demo)
      const device = await navigator.bluetooth?.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });

      setBluetoothDevice(device);
      
      // Connect to device
      const server = await device.gatt?.connect();
      
      if (server) {
        toast.success('Connected to Bluetooth device');
        
        // Mock beacon detection for demo
        const mockBeacon: BeaconData = {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          major: 1,
          minor: 1,
          rssi: -65,
          distance: 2.5
        };
        
        setNearbyBeacons([mockBeacon]);
      }
    } catch (error) {
      console.error('Bluetooth scanning error:', error);
      toast.error('Failed to start Bluetooth scanning');
    } finally {
      setIsScanning(false);
    }
  }, [isSupported]);

  const stopScanning = useCallback(() => {
    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setIsScanning(false);
    setNearbyBeacons([]);
    setBluetoothDevice(null);
    toast.info('Bluetooth scanning stopped');
  }, [bluetoothDevice]);

  return {
    isScanning,
    isSupported,
    nearbyBeacons,
    startScanning,
    stopScanning
  };
};