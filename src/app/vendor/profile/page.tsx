"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiClock, FiMapPin, FiMap, FiUploadCloud, FiFileText, FiUser, FiPhone, FiMail } from "react-icons/fi";
import api from "../../../lib/api";

export default function VendorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const [user,       setUser]       = useState({ name: "", email: "", phone: "" });
  const [isApproved, setIsApproved] = useState(false);

  const [businessName,      setBusinessName]      = useState("");
  const [fullAddress,       setFullAddress]       = useState("");
  const [city,              setCity]              = useState("");
  const [stateName,         setStateName]         = useState("");
  const [contactNumber,     setContactNumber]     = useState("");
  const [openingTime,       setOpeningTime]       = useState("");
  const [closingTime,       setClosingTime]       = useState("");
  const [storeLat,          setStoreLat]          = useState("");
  const [storeLong,         setStoreLong]         = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName,          setBankName]          = useState("");
  const [accountNumber,     setAccountNumber]     = useState("");
  const [ifscCode,          setIfscCode]          = useState("");

  // New fields
  const [gstNumber,         setGstNumber]         = useState("");
  const [businessEmail,     setBusinessEmail]     = useState("");
  const [upiId,             setUpiId]             = useState("");

  // File Upload states
  const [profileImageFile,        setProfileImageFile]        = useState<File | null>(null);
  const [profileImagePreview,     setProfileImagePreview]     = useState<string | null>(null);
  const [gstCertificateFile,      setGstCertificateFile]      = useState<File | null>(null);
  const [gstCertificateFileName,  setGstCertificateFileName]  = useState<string>("");
  const [storeRegistrationFile,   setStoreRegistrationFile]   = useState<File | null>(null);
  const [storeRegistrationFileName, setStoreRegistrationFileName] = useState<string>("");
  const [idProofFile,             setIdProofFile]             = useState<File | null>(null);
  const [idProofFileName,         setIdProofFileName]         = useState<string>("");

  // Address Suggestions states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoGeocodeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/vendor"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/");
      const u = res.data.user; const p = res.data.profile;
      setUser({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
      setIsApproved(p?.is_approved ?? false);
      if (p) {
        setBusinessName(p.business_name || "");
        setFullAddress(p.full_address || "");
        setCity(p.city || ""); setStateName(p.state || "");
        setContactNumber(p.contact_number || "");
        setOpeningTime(p.opening_time || ""); setClosingTime(p.closing_time || "");
        setStoreLat(p.store_lat ? String(p.store_lat) : "");
        setStoreLong(p.store_long ? String(p.store_long) : "");
        setAccountHolderName(p.account_holder_name || "");
        setBankName(p.bank_name || ""); setAccountNumber(p.account_number || "");
        setIfscCode(p.ifsc_code || "");

        // Load new fields
        setGstNumber(p.gst_number || "");
        setBusinessEmail(p.business_email || "");
        setUpiId(p.upi_id || "");
        if (p.profile_image) setProfileImagePreview(p.profile_image);
        if (p.gst_certificate) setGstCertificateFileName(p.gst_certificate.split("/").pop() || "Uploaded Certificate");
        if (p.store_registration) setStoreRegistrationFileName(p.store_registration.split("/").pop() || "Uploaded Registration");
        if (p.id_proof) setIdProofFileName(p.id_proof.split("/").pop() || "Uploaded ID Proof");
      }
    } catch { router.replace("/vendor"); }
    finally { setLoading(false); }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleGstCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGstCertificateFile(file);
      setGstCertificateFileName(file.name);
    }
  };

  const handleStoreRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoreRegistrationFile(file);
      setStoreRegistrationFileName(file.name);
    }
  };

  const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdProofFile(file);
      setIdProofFileName(file.name);
    }
  };

  const triggerAutoGeocode = (address: string, cityVal: string, stateVal: string) => {
    if (autoGeocodeTimeout.current) clearTimeout(autoGeocodeTimeout.current);

    const queryParts = [address, cityVal, stateVal].map(s => s.trim()).filter(Boolean);
    if (queryParts.length === 0 || (address.trim().length < 3 && cityVal.trim().length < 3)) {
      return;
    }

    const query = queryParts.join(", ");

    autoGeocodeTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`);
        const data = await res.json();
        if (data && data.length > 0) {
          setStoreLat(data[0].lat);
          setStoreLong(data[0].lon);
        }
      } catch (e) {
        console.error("Auto geocoding failed", e);
      }
    }, 1200);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullAddress(val);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=in`);
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (e) {
          console.error("Failed to fetch address suggestions", e);
        }
      }, 600);
    }

    triggerAutoGeocode(val, city, stateName);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCity(val);
    triggerAutoGeocode(fullAddress, val, stateName);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStateName(val);
    triggerAutoGeocode(fullAddress, city, val);
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (autoGeocodeTimeout.current) clearTimeout(autoGeocodeTimeout.current);
    setStoreLat(e.target.value);
  };

  const handleLongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (autoGeocodeTimeout.current) clearTimeout(autoGeocodeTimeout.current);
    setStoreLong(e.target.value);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    if (autoGeocodeTimeout.current) clearTimeout(autoGeocodeTimeout.current);

    setFullAddress(suggestion.display_name);
    setStoreLat(suggestion.lat);
    setStoreLong(suggestion.lon);
    
    if (suggestion.address) {
      const cityVal = suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.address.municipality || suggestion.address.county || "";
      const stateVal = suggestion.address.state || "";
      if (cityVal) setCity(cityVal);
      if (stateVal) setStateName(stateVal);
    }
    
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const detectLocation = () => {
    if (autoGeocodeTimeout.current) clearTimeout(autoGeocodeTimeout.current);

    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setStoreLat(lat.toString());
        setStoreLong(lng.toString());
        
        let foundAddress = fullAddress;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
          const data = await res.json();
          if (data && data.display_name) {
            foundAddress = data.display_name;
            setFullAddress(foundAddress);
            if (data.address) {
              const cityVal = data.address.city || data.address.town || data.address.village || data.address.municipality || data.address.county || "";
              const stateVal = data.address.state || "";
              if (cityVal) setCity(cityVal);
              if (stateVal) setStateName(stateVal);
            }
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        }

        setDetecting(false);
        setSuggestions([]);
        setShowSuggestions(false);
      },
      (error) => {
        alert("Could not get location. Please allow location access in your browser.");
        setDetecting(false);
      }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = new FormData();

      // Business details
      if (businessName.trim()) {
        data.append("business_name", businessName.trim());
      }
      if (businessEmail.trim()) {
        data.append("business_email", businessEmail.trim());
      }
      if (gstNumber.trim()) {
        data.append("gst_number", gstNumber.trim());
      }
      if (fullAddress.trim()) {
        data.append("full_address", fullAddress.trim());
      }
      if (city.trim()) {
        data.append("city", city.trim());
      }
      if (stateName.trim()) {
        data.append("state", stateName.trim());
      }
      if (contactNumber.trim()) {
        data.append("contact_number", contactNumber.trim());
      }

      // Time fields
      if (openingTime) {
        data.append("opening_time", openingTime);
      }
      if (closingTime) {
        data.append("closing_time", closingTime);
      }

      // Store coordinates
      if (storeLat !== "" && !isNaN(Number(storeLat))) {
        data.append("store_lat", Number(storeLat).toString());
      }
      if (storeLong !== "" && !isNaN(Number(storeLong))) {
        data.append("store_long", Number(storeLong).toString());
      }

      // Bank details
      if (accountHolderName.trim()) {
        data.append("account_holder_name", accountHolderName.trim());
      }
      if (bankName.trim()) {
        data.append("bank_name", bankName.trim());
      }
      if (accountNumber.trim()) {
        data.append("account_number", accountNumber.trim());
      }
      if (ifscCode.trim()) {
        data.append("ifsc_code", ifscCode.trim());
      }
      if (upiId.trim()) {
        data.append("upi_id", upiId.trim());
      }

      // File uploads
      if (profileImageFile) {
        data.append("profile_image", profileImageFile);
      }
      if (gstCertificateFile) {
        data.append("gst_certificate", gstCertificateFile);
      }
      if (storeRegistrationFile) {
        data.append("store_registration", storeRegistrationFile);
      }
      if (idProofFile) {
        data.append("id_proof", idProofFile);
      }

      const response = await api.put(
        "/profile/vendor/update/",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("SUCCESS:", response.data);

      setSuccess("Profile updated successfully!");
      setProfileImageFile(null);
      setGstCertificateFile(null);
      setStoreRegistrationFile(null);
      setIdProofFile(null);
      
      await fetchProfile();
      setTimeout(() => setSuccess(""), 3000);

    } catch (err: any) {
      console.error("FULL BACKEND ERROR:", err?.response?.data);
      setError(JSON.stringify(err?.response?.data) || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inp = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-sm placeholder-gray-400 transition-shadow";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="h-full flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your store details, bank information, and official documents</p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pb-4">
        {/* ── Avatar + status row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-amber-400" />
            <div className="p-5 flex flex-col items-center text-center">
              <div className="relative mb-3 group">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 border-2 border-orange-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-orange-600">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() ?? "V"
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors border border-white">
                  <FiUploadCloud size={14} />
                  <input type="file" onChange={handleProfileImageChange} accept="image/*" className="hidden" />
                </label>
              </div>
              <h2 className="font-bold text-gray-900 text-lg">{businessName || user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.phone && <p className="text-gray-500 text-sm mt-0.5">📞 {user.phone}</p>}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {isApproved ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                  {isApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => router.push("/vendor/products")}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-orange-50 hover:bg-orange-100 rounded-xl text-sm font-semibold text-orange-700 transition-colors">
                📦 Manage Products
              </button>
              <button onClick={() => router.push("/vendor/orders")}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                📋 View Orders
              </button>
              <button onClick={() => router.push("/vendor/settings")}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 transition-colors">
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* ── Forms ── */}
        <div className="flex flex-col gap-4">
          {/* Business details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Business Name</label>
                <input className={inp} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Raman Hardware" />
              </div>
              <div>
                <label className={lbl}>Business Email</label>
                <input className={inp} type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="e.g. contact@raman.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Contact Number</label>
                <input className={inp} value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g. 9876543210" />
              </div>
              <div>
                <label className={lbl}>GST Number</label>
                <input className={inp} value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="e.g. 24AAAAB1111C1Z0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Opening Time</label><input type="time" className={inp} value={openingTime} onChange={e => setOpeningTime(e.target.value)} /></div>
              <div><label className={lbl}>Closing Time</label><input type="time" className={inp} value={closingTime} onChange={e => setClosingTime(e.target.value)} /></div>
            </div>
          </div>

          {/* Location details (with Autocomplete and GPS location detection) */}
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><FiMapPin className="text-orange-500" /> Store Location</h3>
                <p className="text-orange-600 text-xs mt-0.5 font-medium">⚠️ Required — customer and serviceman geofencing depend on coordinates</p>
              </div>
              <button 
                type="button" 
                onClick={detectLocation}
                disabled={detecting}
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 transition-colors bg-orange-50 px-3 py-2 rounded-xl border border-orange-200 disabled:opacity-50"
              >
                {detecting ? (
                  <><span className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" /> Locating...</>
                ) : (
                  <><FiMap size={13} /> Detect Location</>
                )}
              </button>
            </div>

            <div>
              <label className={lbl}>Full Address</label>
              <div className="relative">
                <input 
                  value={fullAddress} 
                  onChange={handleAddressChange}
                  placeholder="Start typing your store address..." 
                  className={inp} 
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <div 
                        key={s.place_id || idx} 
                        onClick={() => handleSelectSuggestion(s)} 
                        className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 text-left"
                      >
                        <p className="text-sm text-gray-800 font-medium leading-tight">
                          {s.display_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>City</label><input className={inp} value={city} onChange={handleCityChange} placeholder="e.g. Vadodara" /></div>
              <div><label className={lbl}>State</label><input className={inp} value={stateName} onChange={handleStateChange} placeholder="e.g. Gujarat" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Latitude</label><input className={inp} value={storeLat} onChange={handleLatChange} placeholder="22.3283" /></div>
              <div><label className={lbl}>Longitude</label><input className={inp} value={storeLong} onChange={handleLongChange} placeholder="73.2421" /></div>
            </div>

            {storeLat && storeLong && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1 font-semibold">
                <FiCheckCircle size={13} /> Location coordinates pinned successfully ({Number(storeLat).toFixed(4)}, {Number(storeLong).toFixed(4)})
              </p>
            )}
          </div>

          {/* Bank & Payment Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Bank & Payment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Account Holder Name</label>
                <input className={inp} value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} placeholder="Full name as per bank" />
              </div>
              <div>
                <label className={lbl}>Bank Name</label>
                <input className={inp} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Bank of Baroda" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Account Number</label>
                <input className={inp} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" />
              </div>
              <div>
                <label className={lbl}>IFSC Code</label>
                <input className={inp} value={ifscCode} onChange={e => setIfscCode(e.target.value)} placeholder="BARB0XYZABC" />
              </div>
            </div>

            <div>
              <label className={lbl}>UPI ID</label>
              <input className={inp} value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. businessname@okaxis" />
            </div>
          </div>

          {/* Upload Documents Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Upload Documents</h3>
            <p className="text-gray-400 text-xs mt-0.5">Please upload official files or images to verify your business</p>

            {/* GST Certificate */}
            <div className="space-y-1.5">
              <label className={lbl}>GST Certificate</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-between border border-dashed border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors overflow-hidden">
                  <span className="text-sm text-gray-500 truncate mr-2">
                    {gstCertificateFileName || "Upload GST Certificate (PDF, Image)"}
                  </span>
                  <FiUploadCloud className="text-gray-400 flex-shrink-0" size={18} />
                  <input type="file" onChange={handleGstCertificateChange} className="hidden" accept=".pdf,image/*" />
                </label>
                {gstCertificateFileName && (
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 flex-shrink-0">
                    <FiCheckCircle size={12} /> Ready
                  </span>
                )}
              </div>
            </div>

            {/* Store Registration */}
            <div className="space-y-1.5">
              <label className={lbl}>Store Registration Certificate</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-between border border-dashed border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors overflow-hidden">
                  <span className="text-sm text-gray-500 truncate mr-2">
                    {storeRegistrationFileName || "Upload Store Registration Certificate (PDF, Image)"}
                  </span>
                  <FiUploadCloud className="text-gray-400 flex-shrink-0" size={18} />
                  <input type="file" onChange={handleStoreRegistrationChange} className="hidden" accept=".pdf,image/*" />
                </label>
                {storeRegistrationFileName && (
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 flex-shrink-0">
                    <FiCheckCircle size={12} /> Ready
                  </span>
                )}
              </div>
            </div>

            {/* ID Proof */}
            <div className="space-y-1.5">
              <label className={lbl}>ID Proof (Aadhaar / Pan Card / Voter ID)</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-between border border-dashed border-gray-300 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors overflow-hidden">
                  <span className="text-sm text-gray-500 truncate mr-2">
                    {idProofFileName || "Upload ID Proof Document (PDF, Image)"}
                  </span>
                  <FiUploadCloud className="text-gray-400 flex-shrink-0" size={18} />
                  <input type="file" onChange={handleIdProofChange} className="hidden" accept=".pdf,image/*" />
                </label>
                {idProofFileName && (
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 flex-shrink-0">
                    <FiCheckCircle size={12} /> Ready
                  </span>
                )}
              </div>
            </div>
          </div>

          {success && <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"><FiCheckCircle size={15} /> {success}</div>}
          {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">✕ {error}</div>}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
