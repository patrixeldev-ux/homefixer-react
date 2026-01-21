"use client";

import React from "react";
import { useGeolocated } from "react-geolocated";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getDistance, getPreciseDistance } from "geolib";
import "leaflet/dist/leaflet.css";

export default function MapsPage() {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  // Dummy data for serviceman's location
  const servicemanLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: 10,
    heading: 90,
    speed: 5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Maps Feature</h1>
      
      {/* Customer's Location */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Your Location</h2>
        {!isGeolocationAvailable ? (
          <div className="text-red-500">Your browser does not support Geolocation</div>
        ) : !isGeolocationEnabled ? (
          <div className="text-red-500">Geolocation is not enabled. Please allow location access to view your location.</div>
        ) : coords ? (
          <table className="table-auto border-collapse border border-slate-400 mx-auto">
            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Latitude</td>
                <td className="border border-slate-300 px-4 py-2">{coords.latitude}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Longitude</td>
                <td className="border border-slate-300 px-4 py-2">{coords.longitude}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Altitude</td>
                <td className="border border-slate-300 px-4 py-2">{coords.altitude}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Heading</td>
                <td className="border border-slate-300 px-4 py-2">{coords.heading}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-4 py-2">Speed</td>
                <td className="border border-slate-300 px-4 py-2">{coords.speed}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-slate-500">Getting your location data...</div>
        )}
      </div>

      {/* Serviceman's Location */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Serviceman's Location</h2>
        <table className="table-auto border-collapse border border-slate-400 mx-auto">
          <tbody>
            <tr>
              <td className="border border-slate-300 px-4 py-2">Latitude</td>
              <td className="border border-slate-300 px-4 py-2">{servicemanLocation.latitude}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-4 py-2">Longitude</td>
              <td className="border border-slate-300 px-4 py-2">{servicemanLocation.longitude}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-4 py-2">Altitude</td>
              <td className="border border-slate-300 px-4 py-2">{servicemanLocation.altitude}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-4 py-2">Heading</td>
              <td className="border border-slate-300 px-4 py-2">{servicemanLocation.heading}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-4 py-2">Speed</td>
              <td className="border border-slate-300 px-4 py-2">{servicemanLocation.speed}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Distance and Time Calculation */}
      {coords && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Distance & Estimated Time</h2>
          <div className="bg-white p-4 rounded-xl shadow mx-auto max-w-md">
            {(() => {
              const distance = getDistance(
                { latitude: coords.latitude, longitude: coords.longitude },
                { latitude: servicemanLocation.latitude, longitude: servicemanLocation.longitude }
              );
              const distanceKm = (distance / 1000).toFixed(2);
              const estimatedTimeHours = (distance / 1000 / 30).toFixed(2); // Assuming 30 km/h average speed
              return (
                <>
                  <p className="text-lg font-medium">Distance: {distanceKm} km</p>
                  <p className="text-lg font-medium">Estimated Time: {estimatedTimeHours} hours</p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Map View</h2>
        {coords ? (
          <div style={{ height: "400px", width: "100%" }}>
            {/* @ts-ignore */}
            <MapContainer center={[coords.latitude, coords.longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[coords.latitude, coords.longitude]}>
                <Popup>Your Location</Popup>
              </Marker>
              <Marker position={[servicemanLocation.latitude, servicemanLocation.longitude]}>
                <Popup>Serviceman's Location</Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="text-slate-500">Loading map...</div>
        )}
      </div>
    </div>
  );
}
