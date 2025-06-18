# Device Mapping in Battery Dashboard

## Overview

The Battery Dashboard now includes a device mapping system that allows you to select devices using user-friendly names instead of raw IMEI numbers.

## Device Mapping Configuration

The mapping is configured in `frontend/src/components/BatteryDashboard.jsx` in the `deviceMap` object:

```javascript
const deviceMap = useMemo(() => ({
  'AB 01-P': '359214420551701',
  'DC 01-P': '359214420463410', 
  'DC 01-E': '864207076676382',
  'AB 01-E': '864207076682877'
}), []);
```

## How It Works

1. **Device Selection**: Users select devices by their friendly names (e.g., "AB 01-P") from the dropdown
2. **IMEI Resolution**: The system automatically maps the selected name to its corresponding IMEI number
3. **Data Fetching**: The API calls use the resolved IMEI to fetch battery data for the selected device
4. **Display**: The UI shows both the friendly name and the IMEI for transparency

## Features

- **User-Friendly Interface**: Device names are easier to remember and identify
- **Automatic Mapping**: No need to memorize or look up IMEI numbers
- **Transparency**: The corresponding IMEI is displayed below the device selector
- **Error Handling**: Clear error messages when devices are not available
- **Console Logging**: Device selections are logged for debugging

## Adding New Devices

To add a new device to the mapping:

1. Open `frontend/src/components/BatteryDashboard.jsx`
2. Add a new entry to the `deviceMap` object:
   ```javascript
   'Your Device Name': 'IMEI_NUMBER_HERE'
   ```
3. The device will automatically appear in the dropdown after refresh

## API Integration

The system works seamlessly with the existing API:
- Device data is fetched using: `${API_BASE_URL}/devices/data/${selectedImei}`
- The IMEI is resolved from the selected device name
- All existing functionality remains unchanged

## Benefits

- **Better User Experience**: No need to remember long IMEI numbers
- **Easier Device Identification**: Descriptive names make it clear which device you're monitoring
- **Consistent Interface**: Standard dropdown selection pattern
- **Maintainable**: Easy to add/remove devices by updating the mapping object

## Example Usage

1. Select "AB 01-P" from the dropdown
2. System automatically uses IMEI "359214420551701" for API calls
3. Battery data for that specific device is displayed
4. User sees "IMEI: 359214420551701" below the selector for reference 