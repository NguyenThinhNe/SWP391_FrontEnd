import {
    BuildingsIcon,
    CameraIcon,
    CarIcon,
    CheckCircleIcon,
    CloudArrowUpIcon,
    InfoIcon,
    PackageIcon,
    PlusCircleIcon,
    TrashIcon,
    WarningCircleIcon,
    XCircleIcon,
} from "@phosphor-icons/react";
import { useWarrantyClaims } from "../../../../api/useWarrantyClaims";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Loader from "../../../../components/Loader";
import { SuccessNotification, ErrorNotification } from "../../../../components/Notification";
import { useAuth } from "../../../../app/AuthProvider";
import axiousInstance from "../../../../api/axiousInstance";
import profilePlaceholder from "../../../../assets/profile-placeholder.png";
import { usePartApi } from "../../../../api/usePartApi";
import { useCloudinaryUpload } from "../../../../hooks/useCloudinaryUpload";
import { v4 as uuidv4 } from "uuid";

// Normalize image src: if backend returns a relative path (e.g. "placeholder/.."),
// prefix with a sensible backend base URL. Prefer VITE_API_BASE_URL if defined,
// otherwise fall back to axiosInstance.defaults.baseURL (unless it's '/api')
// or window.location.origin.
const normalizeSrc = (src) => {
    if (!src) return src;
    // If already absolute (http/https), data or blob or root-relative, handle specially
    if (/^(https?:|data:|blob:)/.test(src)) return src;

    // If root-relative (starts with '/'), prefer backend URL over dev proxy '/api'
    const backendEnv = import.meta.env.VITE_API_BASE_URL;
    const axiosBase = axiousInstance.defaults.baseURL || '';

    // Determine backend host: prefer explicit env, then axiosBase if present, else in dev fallback to localhost:5081, else window.location.origin
    let backendHost;
    if (backendEnv) {
        backendHost = backendEnv.replace(/\/$/, '');
    } else if (axiosBase && axiosBase !== '/api') {
        backendHost = axiosBase.replace(/\/$/, '');
    } else if (import.meta.env.DEV) {
        backendHost = 'http://localhost:5081';
    } else {
        backendHost = window.location.origin.replace(/\/$/, '');
    }

    // If src already starts with '/', it's root-relative on backend host
    if (src.startsWith('/')) {
        return backendHost + src;
    }

    // Otherwise src is relative without leading slash
    return backendHost + '/' + src.replace(/^\//, '');
};

export default function EditClaimRequestsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { user } = useAuth();
    const { row, fetchClaimById, updateClaim, loading, error } = useWarrantyClaims(user?.userId);
    const { fetchPartsByVin, fetchParts, partLoading } = usePartApi();
    
    // 🧩 Add dynamic parts state
    const [parts, setParts] = useState([]);
    const [availableParts, setAvailableParts] = useState([]); // Store parts fetched from API for dropdown
    
    // 🖼️ Images state
    const [uploadedImages, setUploadedImages] = useState([]);
    
    // �️ Modal state for image preview
    const [selectedImage, setSelectedImage] = useState(null);
    
    // �📝 Form state for controlled inputs
    const [formData, setFormData] = useState({
        vin: "",
        vehicleName: "",
        purchaseDate: "",
        mileAge: "",
        issueDescription: "",
        claimDate: "",
        serviceCenterName: "",
        technicianName: "",
        actionType: 0, // Service Center Request
    });
    
    // 📁 File upload state
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    // Cloudinary integration for new file uploads
    const fileInputRef = useRef(null);
    const { uploadFile, error: uploadError } = useCloudinaryUpload(
        'hqhoangvuong',
        'warranty_claims_upload'
    );
    const [uploadingFiles, setUploadingFiles] = useState(false);
    
    // 🔄 Loading state for submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 🔔 Notification state
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (id) {
            console.log("🔄 [EditClaimRequestPage] Fetching claim by ID:", id);
            fetchClaimById(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, location?.key]); // Removed location?.state?.refresh to prevent double fetch

    // When data loads, set initial form data and parts
    useEffect(() => {
        if (row) {
            console.log("[EditClaimRequestPage] Loading data into form...");
            console.log("[EditClaimRequestPage] Row issueDescription:", row.issueDescription);
            console.log("[EditClaimRequestPage] Row images count:", row.images?.length || 0);
            console.log("[EditClaimRequestPage] Row claimImages count:", row.claimImages?.length || 0);
            // Format dates for date input (YYYY-MM-DD)
            const formatDateForInput = (dateString) => {
                if (!dateString) return "";
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return "";
                    return date.toISOString().split('T')[0];
                } catch {
                    return dateString.split('T')[0] || dateString;
                }
            };
            
            setFormData({
                vin: row.vin || "",
                vehicleName: row.vehicleName || "",
                purchaseDate: formatDateForInput(row.purchaseDate),
                mileAge: row.mileAge || row.mileage || "",
                issueDescription: row.issueDescription || "",
                claimDate: formatDateForInput(row.claimDate),
                serviceCenterName: row.serviceCenterName || "",
                technicianName: row.technicianName || "",
                actionType: row.actionType || 0, // Load actionType from data
            });
            
            // Handle parts - convert from API format to form format
            // Safety: Filter out null/undefined items and ensure valid array
            if (row.parts && Array.isArray(row.parts) && row.parts.length > 0) {
                const validParts = row.parts
                    .filter(part => part !== null && part !== undefined) // Filter out null/undefined
                    .map(part => ({
                        partName: part?.partName || "",
                        partCode: part?.partNumber || part?.partCode || "",
                        replacementDate: formatDateForInput(part?.replacementDate),
                        partId: part?.partId || "",
                        quantity: part?.quantity || 1,
                        price: part?.price || 0,
                        availablePartNumbers: [], // Will be populated when fetching parts by VIN
                    }));
                
                // If we have valid parts, use them; otherwise use empty array with default
                if (validParts.length > 0) {
                    setParts(validParts);
                } else {
                    setParts([
                        {
                            partName: "",
                            partCode: "",
                            replacementDate: "",
                            partId: "",
                            quantity: 1,
                            price: 0,
                            availablePartNumbers: [],
                        },
                    ]);
                }
            } else {
                // Default empty part if no parts exist
                setParts([
                    {
                        partName: "",
                        partCode: "",
                        replacementDate: "",
                        partId: "",
                        quantity: 1,
                        price: 0,
                        availablePartNumbers: [],
                    },
                ]);
            }
            
            // Handle images - populate from API response
            // Priority: row.images > row.claimImages > row.evidenceUrls
            let validImages = [];
            
            if (row.images && Array.isArray(row.images) && row.images.length > 0) {
                // Use row.images if available (preferred format)
                validImages = row.images
                    .filter(img => img !== null && img !== undefined)
                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) // Sort by orderIndex
                    .map(img => ({
                        imageId: img.imageId,
                        url: img.imageUrl || img.url,
                        orderIndex: img.orderIndex !== undefined ? img.orderIndex : 0,
                        isExisting: true, // Flag to identify existing images from API
                    }));
            } else if (row.claimImages && Array.isArray(row.claimImages) && row.claimImages.length > 0) {
                // Fallback to row.claimImages
                validImages = row.claimImages
                    .filter(img => img !== null && img !== undefined)
                    .map((img, index) => ({
                        imageId: img.imageId || img.id,
                        url: img.imageUrl || img.url || img,
                        orderIndex: img.orderIndex !== undefined ? img.orderIndex : index,
                        isExisting: true,
                    }));
            } else if (row.evidenceUrls && Array.isArray(row.evidenceUrls) && row.evidenceUrls.length > 0) {
                // Fallback to row.evidenceUrls (array of URLs)
                validImages = row.evidenceUrls
                    .filter(url => url !== null && url !== undefined && url !== "")
                    .map((url, index) => ({
                        imageId: null,
                        url: url,
                        orderIndex: index,
                        isExisting: true,
                    }));
            }
            
            console.log("🖼️ [EditClaimRequestPage] Loaded images from API:", validImages.length, "images");
            setUploadedImages(validImages);
            
            // Also set uploadedFiles for backward compatibility (if needed)
            if (validImages.length > 0) {
                const existingFiles = validImages.map((img, index) => ({
                    file: null,
                    preview: img.url,
                    name: `image-${index + 1}.jpg`,
                    size: 0,
                    url: img.url,
                }));
                setUploadedFiles(existingFiles);
            } else {
                setUploadedFiles([]);
            }
        }
    }, [row]);

    // ✏️ Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 🔍 Fetch parts when VIN changes (similar to CreateClaimRequestPage)
    useEffect(() => {
        const fetchPartsForVin = async () => {
            if (!formData.vin || formData.vin.trim() === "") {
                setAvailableParts([]);
                return;
            }

            try {
                console.log("🔍 [EditClaimRequestPage] Fetching parts for VIN:", formData.vin);
                
                let partData = null;
                
                // Try to fetch parts by VIN first
                try {
                    partData = await fetchPartsByVin(formData.vin);
                    console.log("✅ [EditClaimRequestPage] Fetched parts by VIN:", partData);
                    
                    // If returned empty array, it might be 404 - try fallback
                    if (!partData || (Array.isArray(partData) && partData.length === 0)) {
                        console.warn("⚠️ [EditClaimRequestPage] fetchPartsByVin returned empty array, trying fallback...");
                        throw new Error("Empty result from fetchPartsByVin");
                    }
                } catch (vinError) {
                    // If endpoint doesn't exist (404), fallback to fetch all parts and filter by VIN
                    console.warn("⚠️ [EditClaimRequestPage] Endpoint /parts/by-vin not available (404), fetching all parts and filtering...");
                    console.warn("⚠️ [EditClaimRequestPage] Error:", vinError.response?.status, vinError.message);
                    
                    // Fetch all parts
                    const allPartsResponse = await axiousInstance.get("/parts");
                    let allPartsData = null;
                    
                    if (Array.isArray(allPartsResponse)) {
                        allPartsData = allPartsResponse;
                    } else if (Array.isArray(allPartsResponse?.data)) {
                        allPartsData = allPartsResponse.data;
                    } else if (allPartsResponse?.data?.data && Array.isArray(allPartsResponse.data.data)) {
                        allPartsData = allPartsResponse.data.data;
                    }
                    
                    if (allPartsData && Array.isArray(allPartsData)) {
                        console.log("📋 [EditClaimRequestPage] All parts fetched:", allPartsData.length, "total parts");
                        console.log("🔍 [EditClaimRequestPage] Filtering by VIN:", formData.vin);
                        
                        // Filter parts by VIN and format them
                        const normalizeVin = (vin) => vin?.toString().trim().toLowerCase() || "";
                        const normalizedSelectedVin = normalizeVin(formData.vin);
                        
                        const filteredParts = allPartsData.filter(part => {
                            const partVin = part.vin || part.VIN || part.vehicleVin;
                            const normalizedPartVin = normalizeVin(partVin);
                            return normalizedPartVin === normalizedSelectedVin;
                        });
                        
                        console.log("✅ [EditClaimRequestPage] Found", filteredParts.length, "parts matching VIN");
                        
                        // Format parts to match the expected structure
                        partData = filteredParts.map(part => {
                            const partNumbersArray = part.partNumber || part.partNumbers || [];
                            const numbersArray = Array.isArray(partNumbersArray) ? partNumbersArray : [];
                            
                            return {
                                partId: part.partId,
                                partName: part.partName,
                                partNumber: numbersArray,
                                partNumbers: numbersArray,
                                partDescription: part.partDescription,
                                vehiclePartId: part.vehiclePartId,
                                status: part.status,
                                vin: part.vin,
                                vehicleName: part.vehicleName || "Unknown",
                                model: part.model || "",
                                quantity: part.quantity || 0,
                            };
                        });
                    } else {
                        partData = [];
                    }
                }

                if (partData && Array.isArray(partData) && partData.length > 0) {
                    console.log("✅ [EditClaimRequestPage] Setting available parts:", partData.length, "items");
                    setAvailableParts(partData);
                } else {
                    console.warn("⚠️ [EditClaimRequestPage] No parts data or empty array received");
                    setAvailableParts([]);
                }
            } catch (error) {
                console.error("❌ [EditClaimRequestPage] Error fetching parts:", error);
                setAvailableParts([]);
            }
        };

        fetchPartsForVin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.vin]);

    // 🔄 Populate availablePartNumbers for existing parts when availableParts is loaded
    useEffect(() => {
        if (availableParts.length > 0 && parts.length > 0) {
            const updatedParts = parts.map(part => {
                // If part already has partName but no availablePartNumbers, populate it
                if (part.partName && (!part.availablePartNumbers || part.availablePartNumbers.length === 0)) {
                    const matchingPart = availableParts.find(ap => ap.partName === part.partName);
                    if (matchingPart) {
                        const partNumbersArray = matchingPart.partNumber || matchingPart.partNumbers || [];
                        const numbersArray = Array.isArray(partNumbersArray) ? partNumbersArray : [];
                        
                        console.log(`🔄 [EditClaimRequestPage] Populating availablePartNumbers for part "${part.partName}":`, numbersArray);
                        
                        return {
                            ...part,
                            availablePartNumbers: numbersArray,
                            // If partCode is empty but we have part numbers, auto-select first one
                            partCode: part.partCode || (numbersArray.length > 0 ? numbersArray[0] : ""),
                        };
                    }
                }
                return part;
            });
            
            // Only update if something changed
            const hasChanges = updatedParts.some((updatedPart, index) => {
                const originalPart = parts[index];
                return JSON.stringify(updatedPart.availablePartNumbers) !== JSON.stringify(originalPart.availablePartNumbers) ||
                       updatedPart.partCode !== originalPart.partCode;
            });
            
            if (hasChanges) {
                console.log("🔄 [EditClaimRequestPage] Updating parts with availablePartNumbers");
                setParts(updatedParts);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableParts, parts]);
    
    // 📁 File upload handlers
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = async (files) => {
        const validFiles = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.mov'];

        files.forEach((file) => {
            // Check file size
            if (file.size > maxSize) {
                setNotification({
                    type: "error",
                    message: `File "${file.name}" exceeds 10MB limit`,
                });
                return;
            }

            // Check file type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
                setNotification({
                    type: "error",
                    message: `File "${file.name}" is not a supported format (JPG, PNG, MP4, MOV)`,
                });
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length === 0) return;

        // Upload to Cloudinary
        console.log("[EditClaimRequestPage] Starting upload of", validFiles.length, "file(s)...");
        setUploadingFiles(true);
        
        try {
            const uploadPromises = validFiles.map(async (file, index) => {
                console.log(`[EditClaimRequestPage] Uploading file ${index + 1}/${validFiles.length}: ${file.name}`);
                const result = await uploadFile(file);
                console.log(`[EditClaimRequestPage] File ${index + 1} uploaded successfully:`, result.url);
                return {
                    id: uuidv4(),
                    url: result.url,
                    publicId: result.publicId,
                    format: result.format,
                    resourceType: result.resourceType,
                    fileName: file.name,
                    size: file.size,
                    preview: file.type.startsWith('image/') ? result.url : null,
                };
            });

            const results = await Promise.all(uploadPromises);
            console.log("[EditClaimRequestPage] All files uploaded. Total images:", uploadedImages.length + results.length);
            
            // Add to uploadedImages (for display and save) - this contains both existing and newly uploaded images
            setUploadedImages(prev => [...prev, ...results]);
            
            setNotification({
                type: "success",
                message: `${validFiles.length} file(s) uploaded successfully`,
                subText: 'Files uploaded to cloud storage'
            });
        } catch (error) {
            console.error('Error uploading files:', error);
            setNotification({
                type: "error",
                message: 'Failed to upload files',
                subText: error.message
            });
        } finally {
            setUploadingFiles(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleRemoveFile = (index) => {
        setUploadedFiles((prev) => {
            const fileToRemove = prev[index];
            if (fileToRemove?.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };
    
    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            uploadedFiles.forEach((file) => {
                if (file.preview && file.file) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // 🔘 Handle Service Center Request change
    const handleActionTypeChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            actionType: parseInt(e.target.value),
        }));
    };

    // ➕ Add new part
    const handleAddPart = () => {
        // Safety: Ensure parts is always an array
        const currentParts = Array.isArray(parts) ? parts : [];
        setParts([
            ...currentParts,
            { partName: "", partCode: "", replacementDate: "", partId: "", quantity: 1, price: 0, availablePartNumbers: [] },
        ]);
    };

    // 🗑 Remove part
    const handleRemovePart = (index) => {
        // Safety: Ensure parts is array and filter safely
        if (!Array.isArray(parts)) {
            setParts([{ partName: "", partCode: "", replacementDate: "", partId: "", quantity: 1, price: 0 }]);
            return;
        }
        const filtered = parts.filter((_, i) => i !== index);
        // Ensure at least one part remains
        if (filtered.length === 0) {
            setParts([{ partName: "", partCode: "", replacementDate: "", partId: "", quantity: 1, price: 0 }]);
        } else {
            setParts(filtered);
        }
    };

    // ✏️ Update part field
    const handlePartChange = (index, field, value) => {
        // Safety: Ensure parts is array and index is valid
        if (!Array.isArray(parts) || index < 0 || index >= parts.length) {
            return;
        }
        const updated = [...parts];
        if (updated[index]) {
            if (field === "partName") {
                // When part name is selected, auto-fill part code
                const selectedPart = availableParts.find(p => p.partName === value);
                if (selectedPart) {
                    // Handle both partNumber (array) and partNumbers (array) from API
                    const partNumbersArray = selectedPart.partNumber || selectedPart.partNumbers || [];
                    // Ensure it's an array
                    const numbersArray = Array.isArray(partNumbersArray) ? partNumbersArray : [];
                    
                    // Auto-select first part number if available
                    const autoSelectedPartNumber = numbersArray.length > 0 ? numbersArray[0] : "";
                    
                    updated[index] = {
                        ...updated[index],
                        partName: value,
                        partCode: autoSelectedPartNumber, // Auto-fill first part number
                        availablePartNumbers: numbersArray, // Store available part numbers
                    };
                } else {
                    // If part not found, reset available part numbers
                    updated[index] = {
                        ...updated[index],
                        partName: value,
                        partCode: "",
                        availablePartNumbers: [],
                    };
                }
            } else {
                updated[index] = {
                    ...updated[index],
                    [field]: value,
                };
            }
            setParts(updated);
        }
    };

    // 💾 Save
    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("🟢 [EditClaimRequestPage] handleSave called");
        console.log("🟢 [EditClaimRequestPage] id:", id);
        console.log("🟢 [EditClaimRequestPage] formData:", formData);
        
        if (!id) {
            setNotification({
                type: "error",
                message: "Error",
                subText: "Claim ID is missing"
            });
            return;
        }

        setIsSubmitting(true);
        setNotification(null);

        try {
            // Helper to format date to ISO string
            const formatDateToISO = (dateString) => {
                if (!dateString) return null;
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return null;
                    return date.toISOString();
                } catch {
                    return null;
                }
            };
            
            // Collect image URLs from uploadedImages (includes both existing from API and newly uploaded)
            // uploadedImages now contains:
            // - Existing images from API (with imageId, url, orderIndex)
            // - Newly uploaded images (with id, url from Cloudinary, no orderIndex yet)
            let claimImages = [];
            if (uploadedImages && Array.isArray(uploadedImages) && uploadedImages.length > 0) {
                claimImages = uploadedImages.map((img, index) => ({
                    imageUrl: img.url || img.imageUrl,
                    orderIndex: img.orderIndex !== undefined ? img.orderIndex : index,
                }));
            }
            
            // Format payload according to API requirements
            // Backend PUT /claims/{id} accepts: vin, actionType, partItems, issueDescription, and other fields
            const payload = {
                vin: formData.vin || row?.vin || "",
                vehicleName: formData.vehicleName || row?.vehicleName || "",
                purchaseDate: formData.purchaseDate ? formatDateToISO(formData.purchaseDate) : null,
                mileAge: formData.mileAge ? parseInt(formData.mileAge) : null,
                claimDate: formData.claimDate ? formatDateToISO(formData.claimDate) : null,
                serviceCenterName: formData.serviceCenterName || row?.serviceCenterName || "",
                technicianName: formData.technicianName || row?.technicianName || "",
                actionType: formData.actionType !== undefined ? formData.actionType : (row?.actionType || 0),
                issueDescription: formData.issueDescription || "",
            };

            // Format partItems - match CreateClaimRequestPage format (camelCase)
            // Always include partItems array (even if empty) to match backend expectations
            const filteredParts = parts.filter(part => part && (part.partName || part.partCode || part.partNumber));
            payload.partItems = filteredParts.map(part => {
                const item = {
                    partName: (part.partName || "").trim() || "",
                    partNumber: (part.partCode || part.partNumber || "").toString().trim(),
                    // Backend requires a valid DateTime; default to now when replacementDate missing
                    replacementDate: part.replacementDate
                        ? formatDateToISO(part.replacementDate)
                        : new Date().toISOString(),
                };
                // Only include partId if it exists
                if (part.partId && part.partId.toString().trim()) {
                    item.partId = part.partId.toString().trim();
                }
                return item;
            });

            // Add claimImages (camelCase) - always include, even if empty array
            // Backend expects claimImages array with imageUrl and orderIndex
            payload.claimImages = claimImages;
            
            // 🔍 Debug: Log summary before sending
            console.log("[EditClaimRequestPage] Saving changes...");
            console.log("  Issue Description:", formData.issueDescription ? `"${formData.issueDescription}"` : "(empty)");
            console.log("  Issue Description length:", formData.issueDescription?.length || 0);
            console.log("  Images:", claimImages.length, "image(s)");
            if (claimImages.length > 0) {
                console.log("  Image URLs:", claimImages.map(img => img.imageUrl));
            }
            console.log("  Parts:", payload.partItems.length, "part(s)");
            console.log("  Full payload:", JSON.stringify(payload, null, 2));
            
            const startTime = Date.now();
            
            let response;
            try {
                response = await updateClaim(id, payload);
                const duration = Date.now() - startTime;
                console.log("[EditClaimRequestPage] Save successful in", duration, "ms");
                console.log("[EditClaimRequestPage] Response from backend:", JSON.stringify(response, null, 2));
                
                // Check if issueDescription and images are in response
                if (response) {
                    console.log("[EditClaimRequestPage] Response issueDescription:", response.issueDescription);
                    console.log("[EditClaimRequestPage] Response images:", response.images);
                    console.log("[EditClaimRequestPage] Response claimImages:", response.claimImages);
                }
            } catch (updateError) {
                console.error("[EditClaimRequestPage] Save failed:", updateError);
                throw updateError; // Re-throw to be caught by outer catch
            }
            
            setNotification({
                type: "success",
                message: "Success",
                subText: "Claim updated successfully! Redirecting..."
            });
            
            // Navigate back immediately - ClaimRequestsPage will handle refresh
            // Don't refetch here to avoid double refresh
            setTimeout(() => {
                console.log("🔄 Navigating back to claims list with refresh flag...");
                navigate("/sc-technician/claims", { 
                    replace: true,
                    state: { refresh: true, timestamp: Date.now() } 
                });
            }, 1000);
            
        } catch (err) {
            console.error("Error updating claim:", err);
            
            // 🔍 Extract detailed validation errors
            let errorMessage = "Failed to update claim. Please try again.";
            const errorData = err.response?.data;
            
            if (errorData) {
                // ASP.NET Core validation error format
                if (errorData.errors) {
                    const validationErrors = Object.entries(errorData.errors)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('\n');
                    errorMessage = `Validation errors:\n${validationErrors}`;
                    console.error("📋 Validation errors:", errorData.errors);
                } else if (errorData.title) {
                    errorMessage = errorData.title;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                
                // Log full error details
                console.error("📋 Full error data:", JSON.stringify(errorData, null, 2));
            }
            
            setNotification({
                type: "error",
                message: "Update Failed",
                subText: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loader />;
    if (error)
        return (
            <p className="text-red-500">Error loading claims: {error.message}</p>
        );

    return (
        <div className="w-full">
            {/* Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="relative max-w-5xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            <XCircleIcon size={24} weight="bold" />
                        </button>
                        
                        {/* Image */}
                        <img 
                            src={selectedImage.url} 
                            alt="Evidence"
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                        
                        {/* Image info */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Image #{selectedImage.orderIndex + 1}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                        Order: {selectedImage.orderIndex + 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notifications */}
            {notification && notification.type === "success" && (
                <SuccessNotification
                    message={notification.message}
                    subText={notification.subText}
                    onClose={() => setNotification(null)}
                />
            )}
            {notification && notification.type === "error" && (
                <ErrorNotification
                    message={notification.message}
                    subText={notification.subText}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Warranty Claim Requests</h1>
                    <p className="text-gray-500">
                        Manage and track warranty claim requests
                    </p>
                </div>
            </div>

            <div className="mb-6 mt-20">
                <div className="mt-20 mb-6">
                    <h2 className="text-xl font-semibold mb-1">
                        Edit Claim Request
                    </h2>
                </div>
                <form className="space-y-10" onSubmit={handleSave}>
                    <div className="bg-white border-[3px] border-[#EBEBEB] rounded-2xl p-10">
                        <div className="text-md text-indigo-600 font-medium mb-6 flex items-center gap-2">
                            <InfoIcon size={20} weight="bold" /> Basic Informations
                        </div>
                        <div className="grid grid-cols-3 gap-10">
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Claim Id</p>
                                <input
                                    readOnly={true}
                                    className="p-3 bg-[#F9FAFB] border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Claim ID"
                                    aria-disabled
                                    defaultValue={row?.claimId}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Claim Date</p>
                                <input
                                    type="date"
                                    name="claimDate"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Claim Date"
                                    value={formData.claimDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Service Center</p>
                                <input
                                    type="text"
                                    name="serviceCenterName"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Service Center"
                                    value={formData.serviceCenterName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Created By</p>
                                <input
                                    type="text"
                                    name="technicianName"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Created By"
                                    value={formData.technicianName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-[3px] border-[#EBEBEB] rounded-2xl p-10">
                        <div className="text-md text-indigo-600 font-medium mb-6 flex items-center gap-2">
                            <CarIcon size={20} weight="bold" /> Vehicle Information
                        </div>
                        <div className="grid grid-cols-3 gap-10">
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">VIN code</p>
                                <input
                                    type="text"
                                    name="vin"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="VIN code"
                                    value={formData.vin}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Vehicle Name</p>
                                <input
                                    type="text"
                                    name="vehicleName"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Enter vehicle name"
                                    value={formData.vehicleName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">
                                    Purchase Date of vehicle
                                </p>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Purchase Date of vehicle"
                                    value={formData.purchaseDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">
                                    Current Mileage (km)
                                </p>
                                <input
                                    type="number"
                                    name="mileAge"
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Current Mileage (km)"
                                    value={formData.mileAge}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-[3px] border-[#EBEBEB] rounded-2xl p-10">
                        <div className="text-md text-indigo-600 font-medium mb-6 flex items-center gap-2">
                            <div className="flex items-center justify-between w-full mb-6">
                                <div className="flex items-center gap-2">
                                    <PackageIcon size={20} weight="bold" /> Part Information
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddPart}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all cursor-pointer"
                                >
                                    <PlusCircleIcon size={20} weight="bold" />
                                    Add Part
                                </button>
                            </div>
                        </div>

                        {parts && Array.isArray(parts) && parts.length > 0
                            ? parts
                                .filter(part => part !== null && part !== undefined) // Safety: filter null/undefined
                                .map((part, index) => {
                                    // Safety: Ensure part object exists
                                    if (!part) return null;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="grid grid-cols-3 gap-10 mb-6 relative border p-6 rounded-2xl"
                                        >
                                            <div className="absolute right-3 top-3">
                                                {parts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePart(index)}
                                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                                    >
                                                        <TrashIcon size={20} weight="bold" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="w-full">
                                                <p className="text-sm mb-2 text-[#6B716F]">Part Name</p>
                                                <select
                                                    name="partName"
                                                    className={`p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none ${
                                                        !formData.vin || partLoading 
                                                            ? 'cursor-not-allowed opacity-50' 
                                                            : 'cursor-pointer'
                                                    }`}
                                                    value={part?.partName || ""}
                                                    onChange={(e) => handlePartChange(index, "partName", e.target.value)}
                                                    disabled={!formData.vin || partLoading}
                                                    style={{ 
                                                        pointerEvents: (!formData.vin || partLoading) ? 'none' : 'auto' 
                                                    }}
                                                >
                                                    <option value="">
                                                        {partLoading
                                                            ? "Loading parts..."
                                                            : !formData.vin
                                                            ? "Select a VIN first"
                                                            : availableParts.length === 0
                                                            ? "No parts available for this VIN"
                                                            : "Select Part Name"}
                                                    </option>
                                                    {availableParts.length > 0 && availableParts.map((availablePart) => (
                                                        <option
                                                            key={availablePart.partId || availablePart.partName || Math.random()}
                                                            value={availablePart.partName}
                                                        >
                                                            {availablePart.partName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-full">
                                                <p className="text-sm mb-2 text-[#6B716F]">Part Code</p>
                                                <select
                                                    name="partCode"
                                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none cursor-pointer"
                                                    value={part?.partCode || ""}
                                                    onChange={(e) => handlePartChange(index, "partCode", e.target.value)}
                                                    disabled={!part?.availablePartNumbers || part.availablePartNumbers.length === 0}
                                                >
                                                    {(!part?.availablePartNumbers || part.availablePartNumbers.length === 0) ? (
                                                        <option value="">Select Part Name first</option>
                                                    ) : (
                                                        part.availablePartNumbers.map((num, i) => (
                                                            <option key={i} value={num}>
                                                                {num}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>

                                            <div className="w-full">
                                                <p className="text-sm mb-2 text-[#6B716F]">
                                                    Replacement Date
                                                </p>
                                                <input
                                                    type="date"
                                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full"
                                                    value={part?.replacementDate || ""}
                                                    onChange={(e) =>
                                                        handlePartChange(index, "replacementDate", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            : (
                                // Fallback: Show at least one empty part if array is empty
                                <div className="grid grid-cols-3 gap-10 mb-6 relative border p-6 rounded-2xl">
                                    <div className="w-full">
                                        <p className="text-sm mb-2 text-[#6B716F]">Part Name</p>
                                        <input
                                            className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full"
                                            placeholder="Part Name"
                                            value=""
                                            readOnly
                                        />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm mb-2 text-[#6B716F]">Part Code</p>
                                        <input
                                            className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full"
                                            placeholder="Part Code"
                                            value=""
                                            readOnly
                                        />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-sm mb-2 text-[#6B716F]">Replacement Date</p>
                                        <input
                                            type="date"
                                            className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full"
                                            value=""
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}

                        {/* <div className="grid grid-cols-3 gap-10">
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Part Name</p>
                                <input
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Part Name"
                                    defaultValue={row?.partName || ""}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Part Code</p>
                                <input
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Part Code"
                                    defaultValue={row ? "PIN12334SD" : ""}
                                />
                            </div>
                            <div className="w-full">
                                <p className="text-sm mb-2 text-[#6B716F]">Replacement Date</p>
                                <input
                                    className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none"
                                    placeholder="Replacement Date"
                                    defaultValue={row ? "05/16/2025" : ""}
                                />
                            </div>
                        </div> */}
                    </div>

                    <div className="bg-white border-[3px] border-[#EBEBEB] rounded-2xl p-10">
                        <div className="text-md text-indigo-600 font-medium mb-6 flex items-center gap-2">
                            <WarningCircleIcon size={20} weight="bold" /> Issue Details
                        </div>
                        <div>
                            <p className="text-sm mb-2 text-[#6B716F]">Issue Description</p>
                            <textarea
                                name="issueDescription"
                                className="p-3 bg-white border-[3px] border-[#EBEBEB] rounded-2xl w-full focus:border-[#c6d2ff] focus:outline-none min-h-[120px]"
                                placeholder="Provide a detailed description of the issue..."
                                value={formData.issueDescription}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="bg-white border-[3px] border-[#EBEBEB] rounded-2xl p-10">
                        <div className="text-md text-indigo-600 font-medium mb-6 flex items-center gap-2">
                            <CameraIcon size={20} weight="bold" /> Evidence Upload
                        </div>
                        <div 
                            className="flex flex-col items-center justify-between border-dashed border-2 border-gray-200 rounded-md p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input-edit')?.click()}
                        >
                            <input
                                id="file-input-edit"
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,video/mp4,video/quicktime,.jpg,.jpeg,.png,.mp4,.mov"
                                onChange={handleFileSelect}
                                className="hidden"
                                ref={fileInputRef}
                            />
                            <CloudArrowUpIcon size={50} color="#9CA3AF" weight="fill" />
                            <div className="leading-1 mt-4 mb-10">
                                <p className="mb-3 text-xl font-medium">
                                    Uploaded Images
                                </p>
                                <p className="mb-3 text-md text-[#6B7280] font-medium">
                                    {uploadedImages.length > 0
                                        ? `${uploadedImages.length} image(s) uploaded` 
                                        : 'No images uploaded yet'}
                                </p>
                            </div>
                            
                            {/* Display uploaded images - only show uploadedImages (includes both existing from API and newly uploaded) */}
                            {uploadedImages.length > 0 ? (
                                <div className="w-full mb-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        {uploadedImages.map((image, index) => (
                                            <div key={image.imageId || image.id || `image-${index}`} className="relative group">
                                                <img 
                                                    src={image.url || image.imageUrl} 
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full aspect-[16/9] object-cover rounded-xl border-2 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Remove from uploadedImages
                                                        setUploadedImages(prev => prev.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-2 right-2 bg-white border border-gray-200 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-50 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div className="aspect-[16/9] rounded-xl bg-gray-100" />
                                    <div className="aspect-[16/9] rounded-xl bg-gray-100" />
                                    <div className="aspect-[16/9] rounded-xl bg-gray-100" />
                                </div>
                            )}
                            
                            <div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        document.getElementById('file-input-edit')?.click();
                                    }}
                                    disabled={uploadingFiles}
                                    className={`px-4 py-2 rounded-full ${
                                        uploadingFiles 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                                    } transition-all text-white`}
                                >
                                    {uploadingFiles ? 'Uploading...' : 'Choose a file'}
                                </button>
                                <p className="mt-3 text-sm text-[#6B7280]">
                                    Max file size: 10MB per file. Supported formats: JPG, PNG, MP4, MOV
                                </p>
                                {uploadedImages.length > 0 && (
                                    <p className="mt-2 text-sm text-green-600">
                                        {uploadedImages.length} file(s) uploaded
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-[3px] border-[#EBEBEB] rounded-2xl p-10">
                        <div className="text-md text-indigo-600 font-medium mb-6 flex items-center gap-2">
                            <BuildingsIcon size={20} weight="bold" /> Service Center Request
                        </div>
                        <div className="space-y-2 text-md">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="actionType" 
                                    value="0"
                                    checked={formData.actionType === 0}
                                    onChange={handleActionTypeChange}
                                /> Request replacement part approval
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="actionType" 
                                    value="1"
                                    checked={formData.actionType === 1}
                                    onChange={handleActionTypeChange}
                                /> Request repair approval
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="actionType" 
                                    value="2"
                                    checked={formData.actionType === 2}
                                    onChange={handleActionTypeChange}
                                /> Request reimbursement (repair completed in advance)
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F1F3F4] hover:bg-[#dfe0e2] transition-all cursor-pointer"
                        >
                            <XCircleIcon size={18} />
                            <span>Cancel</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                console.log("🔘 [EditClaimRequestPage] Save button clicked");
                                handleSave(e);
                            }}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-all text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircleIcon size={18} />
                            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
