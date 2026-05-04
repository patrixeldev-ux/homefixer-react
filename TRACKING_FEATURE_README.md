# 📍 Homefixer Live Tracking Feature — Serviceman Side

## 🎯 Overview

A **production-ready** live tracking system for servicemen in the Homefixer platform. This feature enables real-time GPS tracking across a 3-stage journey:

1. **Stage 1: Serviceman → Customer** — Navigate to customer location for inspection
2. **Stage 2: Customer → Vendor** — Travel to vendor to purchase materials
3. **Stage 3: Vendor → Completion** — Complete the service

---

## ✨ Features

### 🗺️ Map & Navigation
- **Leaflet-based** interactive map (no API key required)
- **Real-time GPS tracking** with 4-second update intervals
- **Custom animated markers**:
  - 🔧 Serviceman (blue, pulsing)
  - 🏠 Customer (green)
  - 🏪 Vendor (amber)
- **Dynamic route polylines** with color-coded stages
- **Auto-centering** with smooth animations
- **Manual re-center** button

### 📊 Live Stats
- **Distance calculation** (meters/km) using `geolib`
- **ETA estimation** (based on 25 km/h average speed)
- **Progress bar** showing journey completion
- **Online/offline detection** with fallback UI

### 🎮 Stage Management
- **3-stage workflow** with visual progress indicators
- **Stage-specific CTAs**:
  - "Start Journey" → TO_CUSTOMER
  - "Go to Vendor" → TO_VENDOR
  - "Complete Service" → COMPLETE
- **Skip vendor option** for direct completion

### 🎨 UI/UX
- **Mobile-first responsive design**
- **Theme**: Blue (primary), Green (customer), Amber (vendor), Gray (neutral)
- **Floating action panels** with glassmorphism
- **Bottom slide-up info panel**
- **Smooth transitions** and animations
- **Accessibility-compliant** (WCAG AA)

### 🔒 Edge Cases Handled
- ❌ Location permission denied → Clear error screen with instructions
- 📡 Offline mode → Shows last known position + offline banner
- 🚫 API failures → Graceful error handling with retry
- ⏳ Vendor not assigned → Disabled "Go to Vendor" button
- 🔄 GPS signal loss → Continues with last known position

---

## 📁 File Structure

```
src/
├── hooks/
│   └── useServicemanTracking.ts          # Central state + GPS logic hook
│
├── app/service-man/
│   ├── tracking/[id]/
│   │   └── page.tsx                      # Main tracking page (route)
│   │
│   └── components/
│       ├── MapView.tsx                   # Leaflet map container (SSR-safe)
│       ├── RouteRenderer.tsx             # Markers + polyline renderer
│       ├── LiveTracker.tsx               # Main tracking UI orchestrator
│       ├── StageController.tsx           # Stage panel + CTA buttons
│       └── BookingInfoPanel.tsx          # Bottom info panel (stats + destination)
│
└── lib/
    └── api.ts                            # Axios instance (already exists)
```

---

## 🚀 Setup Instructions

### 1️⃣ Prerequisites

Ensure these dependencies are installed (already in `package.json`):

```json
{
  "leaflet": "^1.9.4",
  "geolib": "^3.3.4",
  "react-icons": "^5.5.0",
  "axios": "^1.13.2"
}
```

If not installed, run:

```bash
npm install leaflet geolib react-icons
```

### 2️⃣ Backend API Requirements

The feature expects these endpoints to exist:

#### **GET** `/api/booking/:id/tracking/`
Returns booking + location data:

```json
{
  "booking_id": 123,
  "status": "ONGOING",
  "customer_name": "John Doe",
  "customer_address": "123 Main St",
  "customer_lat": 28.6139,
  "customer_lng": 77.2090,
  "vendor_lat": 28.6200,
  "vendor_lng": 77.2150,
  "vendor_name": "ABC Hardware",
  "vendor_address": "456 Market Rd",
  "serviceman_name": "Ravi Kumar"
}
```

#### **POST** `/api/location/update/`
Receives serviceman's live position:

```json
{
  "booking_id": 123,
  "latitude": 28.6150,
  "longitude": 77.2100,
  "stage": "TO_CUSTOMER"
}
```

#### **PATCH** `/api/booking/:id/complete/`
Marks the service as complete (already exists).

---

### 3️⃣ Environment Variables

Set your backend URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Or for production:

```env
NEXT_PUBLIC_API_URL=https://api.homefixer.com
```

---

### 4️⃣ Run the App

```bash
npm run dev
```

Navigate to:

```
http://localhost:3000/service-man/tracking/[booking_id]
```

Example:

```
http://localhost:3000/service-man/tracking/123
```

---

## 🧪 Testing

### Manual Testing Checklist

#### ✅ GPS & Permissions
- [ ] Browser prompts for location permission on first load
- [ ] Denying permission shows "Location Access Required" screen
- [ ] Granting permission loads the map with serviceman marker
- [ ] Serviceman marker updates every 4 seconds as you move

#### ✅ Stage Transitions
- [ ] "Start Journey" button appears in TO_CUSTOMER stage
- [ ] Clicking "Start Journey" keeps stage as TO_CUSTOMER (visual confirmation)
- [ ] "Go to Vendor" button appears after vendor is assigned
- [ ] Clicking "Go to Vendor" changes polyline color to amber
- [ ] "Complete Service" button marks booking as done

#### ✅ Map Interactions
- [ ] Map auto-centers on serviceman + destination on load
- [ ] Re-center button (📍) smoothly flies back to serviceman
- [ ] Zoom controls work (bottom-right)
- [ ] Markers are visible and labeled correctly
- [ ] Polyline updates dynamically as serviceman moves

#### ✅ Stats & UI
- [ ] Distance shows in meters (< 1 km) or km (≥ 1 km)
- [ ] ETA updates based on distance
- [ ] Progress bar fills as serviceman approaches destination
- [ ] Online/offline badge reflects network status
- [ ] Bottom panel shows correct destination (customer or vendor)

#### ✅ Edge Cases
- [ ] Offline mode: disconnect WiFi → "Offline" badge appears
- [ ] Vendor not assigned: "Go to Vendor" button is disabled
- [ ] API error: shows error screen with retry button
- [ ] Back button returns to booking detail page

---

### Simulating GPS Movement (for testing)

If you're testing on a desktop without GPS, use browser DevTools:

1. Open **Chrome DevTools** → **⋮ (More tools)** → **Sensors**
2. Under **Location**, select a preset (e.g., "San Francisco") or enter custom lat/lng
3. Change the location every few seconds to simulate movement
4. Watch the serviceman marker move on the map

---

## 🎨 Theme Colors

The feature uses the following color palette:

| Element          | Color                | Hex       | Usage                          |
|------------------|----------------------|-----------|--------------------------------|
| **Primary**      | Blue                 | `#2563eb` | Serviceman marker, TO_CUSTOMER |
| **Customer**     | Green                | `#16a34a` | Customer marker, destination   |
| **Vendor**       | Amber                | `#f59e0b` | Vendor marker, TO_VENDOR       |
| **Success**      | Green                | `#22c55e` | Completion state               |
| **Error**        | Red                  | `#dc2626` | Error screens, offline         |
| **Neutral**      | Slate                | `#64748b` | Text, borders, backgrounds     |

---

## 🔧 Customization

### Change Update Interval

Edit `src/hooks/useServicemanTracking.ts`:

```ts
const POLL_INTERVAL_MS = 4000; // Change to 5000 for 5 seconds
```

### Change Average Speed (for ETA)

Edit `src/hooks/useServicemanTracking.ts`:

```ts
const AVG_SPEED_KMH = 25; // Change to 30 for faster ETA
```

### Change Map Tiles

Edit `src/app/service-man/components/MapView.tsx`:

```ts
// Current: CartoDB Voyager (clean, modern)
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  { ... }
)

// Alternative: OpenStreetMap (classic)
L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { ... }
)
```

### Add Voice Navigation

Install a text-to-speech library:

```bash
npm install react-speech-kit
```

Then add to `LiveTracker.tsx`:

```tsx
import { useSpeechSynthesis } from 'react-speech-kit';

const { speak } = useSpeechSynthesis();

useEffect(() => {
  if (etaMinutes && etaMinutes <= 5) {
    speak({ text: `You are ${etaMinutes} minutes away from your destination.` });
  }
}, [etaMinutes]);
```

---

## 🐛 Troubleshooting

### Map not loading
- **Check**: Leaflet CSS is loaded (inspect Network tab)
- **Fix**: Ensure `<link rel="stylesheet" href="..." />` is in `MapView.tsx`

### Markers not visible
- **Check**: Marker icon URLs are accessible (CDN)
- **Fix**: Verify `https://cdnjs.cloudflare.com/...` is not blocked

### GPS not updating
- **Check**: Browser console for geolocation errors
- **Fix**: Ensure HTTPS (geolocation requires secure context)

### API errors
- **Check**: Network tab for failed requests
- **Fix**: Verify `NEXT_PUBLIC_API_URL` is correct and backend is running

### "Location Access Required" screen stuck
- **Check**: Browser location permission settings
- **Fix**: Go to `chrome://settings/content/location` and allow your site

---

## 📚 Tech Stack

| Technology       | Purpose                          |
|------------------|----------------------------------|
| **Next.js 16**   | React framework (App Router)     |
| **Leaflet**      | Interactive maps (no API key)    |
| **Geolib**       | Distance + geospatial calculations |
| **Axios**        | HTTP client for API calls        |
| **Tailwind CSS** | Utility-first styling            |
| **React Icons**  | Icon library (Feather icons)     |

---

## 🚢 Deployment Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Enable HTTPS (required for geolocation API)
- [ ] Test on real mobile devices (iOS Safari, Android Chrome)
- [ ] Verify backend endpoints return correct data
- [ ] Test offline mode (airplane mode)
- [ ] Check performance (Lighthouse score)
- [ ] Add error tracking (Sentry, LogRocket)
- [ ] Monitor API rate limits for location updates

---

## 📖 API Integration Example

### Backend (Django example)

```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def booking_tracking(request, booking_id):
    booking = Booking.objects.get(id=booking_id)
    return Response({
        'booking_id': booking.id,
        'status': booking.status,
        'customer_name': booking.customer.name,
        'customer_address': booking.customer_address,
        'customer_lat': booking.customer_lat,
        'customer_lng': booking.customer_lng,
        'vendor_lat': booking.vendor.latitude if booking.vendor else None,
        'vendor_lng': booking.vendor.longitude if booking.vendor else None,
        'vendor_name': booking.vendor.business_name if booking.vendor else None,
        'vendor_address': booking.vendor.full_address if booking.vendor else None,
        'serviceman_name': booking.serviceman.name,
    })

@api_view(['POST'])
def location_update(request):
    booking_id = request.data.get('booking_id')
    lat = request.data.get('latitude')
    lng = request.data.get('longitude')
    stage = request.data.get('stage')
    
    # Save to database or cache (Redis)
    LocationUpdate.objects.create(
        booking_id=booking_id,
        latitude=lat,
        longitude=lng,
        stage=stage,
        timestamp=timezone.now()
    )
    
    return Response({'status': 'ok'})
```

---

## 🎓 Learning Resources

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Geolib API](https://github.com/manuelbieh/geolib)
- [Geolocation API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Next.js Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)

---

## 📝 License

This feature is part of the Homefixer platform. All rights reserved.

---

## 👨‍💻 Author

Built with ❤️ by the Homefixer team.

For questions or support, contact: dev@homefixer.com

---

## 🎉 What's Next?

### Potential Enhancements
- 🗣️ **Voice navigation** ("Turn left in 200 meters")
- 📸 **Photo capture** at each stage (proof of visit)
- 💬 **In-app chat** with customer
- 📊 **Analytics dashboard** (average ETA accuracy, distance traveled)
- 🌐 **Multi-language support**
- 🔔 **Push notifications** (customer notified when serviceman is nearby)
- 🚗 **Traffic-aware routing** (Google Directions API integration)
- 📍 **Geofencing** (auto-trigger stage transitions)

---

**Happy Tracking! 🚀**
