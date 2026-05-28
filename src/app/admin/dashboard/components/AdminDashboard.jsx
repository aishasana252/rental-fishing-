'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, ShoppingBag, Compass, Anchor, MapPin, DollarSign,
  AlertTriangle, CheckCircle, Clock, ShieldCheck, Mail, Edit3, Plus, Trash2, Calendar,
  Fish, Waves, User, Lock, Save, Eye, EyeOff, XCircle, LogOut, Menu, X
} from 'lucide-react';


// Automatic client-side image compression utility
const compressImage = (file, maxWidth = 1000, quality = 0.75, returnBase64 = false) => {
  return new Promise((resolve, reject) => {
    // If the file is not an image, resolve with the original file
    if (!file.type.startsWith('image/')) {
      resolve(returnBase64 ? '' : file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Downscale to maxWidth if exceeded
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        if (returnBase64) {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas compression failed'));
                return;
              }
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminDashboard({ session, initialData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem('adminActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // React state to handle database variables
  const [bookings, setBookings] = useState(initialData.bookings);
  const [inventory, setInventory] = useState(initialData.inventory);
  const [lures, setLures] = useState(initialData.lures);
  const [damages, setDamages] = useState(initialData.damages);
  const [customers, setCustomers] = useState(initialData.customers);
  const [messages, setMessages] = useState(initialData.messages);
  const [fishSpecies, setFishSpecies] = useState(initialData.fishSpecies);
  const [restaurants, setRestaurants] = useState(initialData.restaurants);
  const [damagePolicies, setDamagePolicies] = useState(initialData.damagePolicies || []);
  const [generalBrokenImages, setGeneralBrokenImages] = useState(
    initialData.cms?.find(c => c.section_key === 'general_broken_images')?.content_data?.images || []
  );
  
  // Guides State
  const [guides, setGuides] = useState(initialData.guides || []);
  const [editingGuideId, setEditingGuideId] = useState(null);
  const [guideForm, setGuideForm] = useState({ name: '', experience: '', description: '', imageUrl: '' });

  // Rental Gallery State
  const [rentalGallery, setRentalGallery] = useState(initialData.rentalGallery || []);
  const [galleryForm, setGalleryForm] = useState({ caption: '', url: '' });
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [editingGalleryIdx, setEditingGalleryIdx] = useState(null);
  const [editingGalleryCaption, setEditingGalleryCaption] = useState('');

  // Edit Mode Trackers for Other Catalogs
  const [editingLureId, setEditingLureId] = useState(null);
  const [editingFishId, setEditingFishId] = useState(null);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [editingSpotIndex, setEditingSpotIndex] = useState(null);

  // Fishing Spots state — extracted from the site_content locations CMS
  const spotsData = initialData.cms.find(c => c.section_key === 'locations');
  const [fishingSpots, setFishingSpots] = useState(
    (spotsData && spotsData.content_data && Array.isArray(spotsData.content_data.spots))
      ? spotsData.content_data.spots
      : []
  );

  // Form states
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: null, text: '' });

  // Admin Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: session?.fullName || '',
    email: session?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: null, text: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: null, text: '' });
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      setProfileMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileForm.fullName,
          email: profileForm.email,
          currentPassword: profileForm.currentPassword || undefined,
          newPassword: profileForm.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');
      setProfileMsg({ type: 'success', text: data.message || 'Profile updated!' });
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // Damage Policies Form State
  const [damagePolicyForm, setDamagePolicyForm] = useState({
    name: '',
    price: '',
    imageUrl: ''
  });

  // Damage Form
  const [damageForm, setDamageForm] = useState({
    bookingId: '',
    type: '',
    description: ''
  });
  
  const [inventoryForm, setInventoryForm] = useState({ itemName: '', totalQty: '' });

  // CMS Form
  const homepageCms = initialData.cms.find(c => c.section_key === 'homepage')?.content_data || {};
  const heroData = homepageCms.hero;
  const initialSlides = Array.isArray(heroData) ? heroData : [
    { title: heroData?.title || '', subtitle: heroData?.subtitle || '' },
    { title: '', subtitle: '' },
    { title: '', subtitle: '' },
    { title: '', subtitle: '' }
  ];

  const [cmsForm, setCmsForm] = useState({
    slides: initialSlides,
    whyChooseUs: homepageCms.whyChooseUs?.text || '',
    guides: homepageCms.guides || { title: '', text: '', image: '' },
    spots: homepageCms.spots || { title: '', text: '', image: '' },
    dining: homepageCms.dining || { title: '', text: '', image: '' }
  });
  const [currentSlideTab, setCurrentSlideTab] = useState(0);

  // Add Restaurant Form
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    mapLink: '',
    distance: '',
    feeEstimate: ''
  });

  // Add Fish Form
  const [fishForm, setFishForm] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  // Add Fishing Spot Form
  const [spotForm, setSpotForm] = useState({
    name: '',
    terrain: '',
    coordinates: '',
    description: '',
    bestTime: '',
    lures: '',
    difficulty: 'Beginner',
    image: ''
  });

  // Lures Form
  const [lureForm, setLureForm] = useState({
    name: '',
    price: '',
    stockQty: '',
    imageUrl: '',
    presetImage: '/assets/logo 1.jpeg'
  });

  // Detail Modal Booking
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- STATS CALCULATIONS ---
  const totalBookingsCount = bookings.length;
  
  const activeRentalsCount = bookings.filter(
    (b) => !b.guide_booked && (b.status === 'active' || b.status === 'confirmed' || b.status === 'Picked Up' || b.status === 'Active')
  ).length;

  const pendingReturnsCount = bookings.filter(
    (b) => !b.guide_booked && (b.status === 'Picked Up' || b.status === 'Active' || b.status === 'active' || b.status === 'picked_up')
  ).length;

  const lateReturnsCount = bookings.filter(
    (b) => b.status === 'late_return' || b.status === 'Late Return'
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.payment_status === 'paid' || b.payment_status === 'Paid')
    .reduce((sum, b) => sum + parseFloat(b.total_price), 0);

  const damagesCount = damages.length;

  const guideBookingsCount = bookings.filter((b) => b.guide_booked).length;

  const polesItem = inventory.find((i) => i.item_name === 'Fishing Poles') || { available_qty: 20 };
  const availablePoles = polesItem.available_qty;

  // --- CRUD ACTIONS ---

  // 1. Update Booking Status
  const handleStatusChange = async (bookingId, newStatus) => {
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const res = await fetch('/api/admin/bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      setStatusMsg({ type: 'success', text: `Booking status successfully updated to ${newStatus}!` });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Damage Incident
  const handleAddDamage = async (e) => {
    e.preventDefault();
    if (!damageForm.bookingId) {
      alert('Please select a booking reference.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });

    // Auto-calculate fee based on standard catalog (dynamic from policies)
    let fee = 0;
    const policy = damagePolicies.find(p => p.name === damageForm.type);
    if (policy) {
      fee = parseFloat(policy.price);
    }

    try {
      const res = await fetch('/api/admin/damages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: damageForm.bookingId,
          type: damageForm.type,
          fee,
          description: damageForm.description
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit damage report.');

      // Refresh list
      setDamages((prev) => [data.damage, ...prev]);
      // Set booking status to Damaged
      setBookings((prev) =>
        prev.map((b) => (b.id === damageForm.bookingId ? { ...b, status: 'damaged' } : b))
      );

      setStatusMsg({ type: 'success', text: `Damage logged successfully! $${fee}.00 charge recorded.` });
      setDamageForm({ bookingId: '', type: '', description: '' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };
  // 2.5 Image Upload Handler for CMS
  const handleImageUpload = async (e, section) => {
    let file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setStatusMsg({ type: null, text: '' });

    try {
      // Auto compress the image client-side to keep size small and load times instant!
      try {
        file = await compressImage(file, 1000, 0.75, false);
      } catch (compErr) {
        console.warn('Image compression bypassed, uploading original:', compErr);
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setCmsForm(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          image: data.url
        }
      }));
      setStatusMsg({ type: 'success', text: 'Image uploaded successfully. Click Save to apply changes.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  // 3. Update CMS Text
  const handleUpdateCMS = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save CMS text.');

      setStatusMsg({ type: 'success', text: 'CMS content updated successfully on Homepage!' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // 4. Create Restaurant CMS Partner
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurantForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add restaurant.');

      setRestaurants((prev) => [...prev, data.restaurant]);
      setRestaurantForm({ name: '', mapLink: '', distance: '', feeEstimate: '' });
      setStatusMsg({ type: 'success', text: 'New Gourmet Dining Partner added!' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // 5. Create Fish Species CMS entry
  const handleAddFish = async (e) => {
    e.preventDefault();
    if (!fishForm.name || !fishForm.description) {
      alert('Please fill out Name and Description.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const res = await fetch('/api/admin/fish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fishForm.name,
          description: fishForm.description,
          image_url: fishForm.imageUrl || '/assets/logo 1.jpeg'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add fish species.');

      setFishSpecies((prev) => [...prev, data.fish]);
      setFishForm({ name: '', description: '', imageUrl: '' });
      setStatusMsg({ type: 'success', text: 'New Local Game Fish registered in directory!' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // Delete Fish Species
  const handleDeleteFish = async (id) => {
    if (!confirm('Are you sure you want to remove this fish species from the directory?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fish?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete fish species.');

      setFishSpecies((prev) => prev.filter((f) => f.id !== id));
      setStatusMsg({ type: 'success', text: 'Fish species removed from directory.' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFishImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        // Compress to maximum 800px width with 70% quality JPEG Base64
        const compressedBase64 = await compressImage(file, 800, 0.7, true);
        setFishForm((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      } catch (err) {
        console.warn('Image compression failed, using original reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFishForm((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Add Fishing Spot
  const handleAddSpot = async (e) => {
    e.preventDefault();
    if (!spotForm.name || !spotForm.description) {
      alert('Please fill out Name and Description.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const res = await fetch('/api/admin/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spotForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add fishing spot.');

      setFishingSpots(data.spots);
      setSpotForm({ name: '', terrain: '', coordinates: '', description: '', bestTime: '', lures: '', difficulty: 'Beginner', image: '' });
      setStatusMsg({ type: 'success', text: 'New Shore Fishing Hotspot registered!' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // Delete Fishing Spot by index
  const handleDeleteSpot = async (index) => {
    if (!confirm('Are you sure you want to remove this fishing spot?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/spots?index=${index}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete fishing spot.');

      setFishingSpots(data.spots);
      setStatusMsg({ type: 'success', text: 'Fishing spot removed from directory.' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSpotImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        // Compress to maximum 800px width with 70% quality JPEG Base64
        const compressedBase64 = await compressImage(file, 800, 0.7, true);
        setSpotForm((prev) => ({ ...prev, image: compressedBase64 }));
      } catch (err) {
        console.warn('Image compression failed, using original reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSpotForm((prev) => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Add Lure CMS Catalog
  const handleAddLure = async (e) => {
    e.preventDefault();
    if (!lureForm.name || !lureForm.price) {
      alert('Please fill out Name and Price.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const finalImage = lureForm.imageUrl || lureForm.presetImage;
      const res = await fetch('/api/admin/lures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lureForm.name,
          price: parseFloat(lureForm.price),
          image_url: finalImage,
          stock_qty: lureForm.stockQty ? parseInt(lureForm.stockQty) : 20
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register lure.');

      setLures((prev) => [...prev, data.lure]);
      setLureForm({ name: '', price: '', stockQty: '', imageUrl: '', presetImage: '/assets/logo 1.jpeg' });
      setStatusMsg({ type: 'success', text: 'New Premium Island Lure registered successfully!' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // Delete Lure CMS Catalog
  const handleDeleteLure = async (id) => {
    if (!confirm('Are you sure you want to remove this lure from the catalog?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lures?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete.');

      setLures((prev) => prev.filter((l) => l.id !== id));
      setStatusMsg({ type: 'success', text: 'Lure removed from catalog.' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        // Compress to maximum 800px width with 70% quality JPEG Base64
        const compressedBase64 = await compressImage(file, 800, 0.7, true);
        setLureForm((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      } catch (err) {
        console.warn('Image compression failed, using original reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLureForm((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Add Damage Gear Policy
  const handleAddDamagePolicy = async (e) => {
    e.preventDefault();
    if (!damagePolicyForm.name || !damagePolicyForm.price) {
      alert('Please fill out Name and Fine Fee.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const res = await fetch('/api/admin/damage-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: damagePolicyForm.name,
          price: parseFloat(damagePolicyForm.price),
          image_url: damagePolicyForm.imageUrl,
          broken_images: []
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add damage policy.');

      setDamagePolicies((prev) => [...prev, data.policy]);
      setDamagePolicyForm({ name: '', price: '', imageUrl: '' });
      setStatusMsg({ type: 'success', text: 'New dynamic Damage Gear Policy registered!' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // Delete Damage Gear Policy
  const handleDeleteDamagePolicy = async (id) => {
    if (!confirm('Are you sure you want to remove this damage policy? This will delete it on the user rentals page as well.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/damage-policies?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete.');

      setDamagePolicies((prev) => prev.filter((p) => p.id !== id));
      setStatusMsg({ type: 'success', text: 'Damage policy removed successfully.' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDamagePolicyImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        // Compress to maximum 800px width with 70% quality JPEG Base64
        const compressedBase64 = await compressImage(file, 800, 0.7, true);
        setDamagePolicyForm((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      } catch (err) {
        console.warn('Image compression failed, using original reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setDamagePolicyForm((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleGeneralBrokenImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setStatusMsg({ type: null, text: '' });

    try {
      const uploadedUrls = [];
      for (let file of files) {
        // Auto compress the image client-side to keep size small and load times instant!
        try {
          file = await compressImage(file, 1000, 0.75, false);
        } catch (compErr) {
          console.warn('Image compression bypassed for general upload, uploading original:', compErr);
        }

        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        uploadedUrls.push(data.url);
      }

      const res2 = await fetch('/api/admin/general-broken-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: uploadedUrls })
      });
      if (!res2.ok) throw new Error('Failed to save general broken images');

      setGeneralBrokenImages(prev => [...prev, ...uploadedUrls]);
      setStatusMsg({ type: 'success', text: 'General broken images uploaded successfully.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteGeneralBrokenImage = async (url) => {
    if (!confirm('Are you sure you want to delete this broken image?')) return;
    setUploadingImage(true);
    try {
      const res = await fetch(`/api/admin/general-broken-images?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete image');
      setGeneralBrokenImages(prev => prev.filter(img => img !== url));
      setStatusMsg({ type: 'success', text: 'Broken image deleted.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  // 6. Delete Restaurant CMS Partner
  const handleDeleteRestaurant = async (id) => {
    if (!confirm('Are you sure you want to remove this restaurant partner?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/restaurants?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete.');

      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setStatusMsg({ type: 'success', text: 'Restaurant partner removed.' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // 7. Manual Restock Inventory item
  const handleRestock = async (itemName, amount) => {
    setLoading(true);
    try {
      const item = inventory.find(i => i.item_name === itemName);
      if (!item) return;

      const newAvailable = Math.min(item.total_qty, item.available_qty + amount);
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          available_qty: newAvailable,
          total_qty: item.total_qty,
          damaged_qty: item.damaged_qty,
          missing_qty: item.missing_qty
        })
      });
      if (!res.ok) throw new Error('Failed to update inventory.');

      setInventory(prev => prev.map(i => i.item_name === itemName ? { ...i, available_qty: newAvailable } : i));
      setStatusMsg({ type: 'success', text: `Restocked ${itemName} by ${amount} units.` });
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Failed to restock item' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestockLure = async (lureId, amount) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/lures/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lure_id: lureId, amount })
      });
      const data = await res.json();
      if (data.success) {
        setLures(prev => prev.map(l => l.id === lureId ? data.item : l));
        setStatusMsg({ type: 'success', text: `Restocked ${amount} lure(s)` });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Failed to restock lure' });
    } finally {
      setLoading(false);
    }
  };

  // Content Handlers/ 11. Add New Inventory Item
  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.itemName || !inventoryForm.totalQty) {
      alert('Please provide item name and total quantity.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });

    try {
      const res = await fetch('/api/admin/inventory/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add inventory item.');

      setInventory(prev => [...prev, data.item]);
      setStatusMsg({ type: 'success', text: 'New inventory item added successfully!' });
      setInventoryForm({ itemName: '', totalQty: '' });
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // 12. Delete Inventory Item
  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gear item permanently?')) return;
    
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete inventory item.');

      setInventory(prev => prev.filter(i => i.id !== id));
      setStatusMsg({ type: 'success', text: 'Gear item deleted successfully!' });
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // --- CATALOG EDIT ACTIONS & GUIDES CRUD ---
  
  // Guides CRUD handlers
  const handleStartEditGuide = (guide) => {
    setEditingGuideId(guide.id);
    setGuideForm({
      name: guide.name,
      experience: guide.experience || '',
      description: guide.description || '',
      imageUrl: guide.image_url || ''
    });
  };

  const handleCancelEditGuide = () => {
    setEditingGuideId(null);
    setGuideForm({ name: '', experience: '', description: '', imageUrl: '' });
  };

  const handleGuideImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const compressedBase64 = await compressImage(file, 800, 0.7, true);
        setGuideForm((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      } catch (err) {
        console.warn('Image compression failed, using original reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setGuideForm((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleAddGuide = async (e) => {
    e.preventDefault();
    if (!guideForm.name) {
      alert('Guide Name is required.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: null, text: '' });
    try {
      const body = {
        name: guideForm.name,
        experience: guideForm.experience,
        description: guideForm.description,
        image_url: guideForm.imageUrl || '/assets/logo 1.jpeg'
      };

      if (editingGuideId) {
        body.id = editingGuideId;
        const res = await fetch('/api/admin/guides', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update guide.');

        setGuides((prev) => prev.map((g) => (g.id === editingGuideId ? data.guide : g)));
        setEditingGuideId(null);
        setStatusMsg({ type: 'success', text: 'Guide details updated successfully!' });
      } else {
        const res = await fetch('/api/admin/guides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add guide.');

        setGuides((prev) => [...prev, data.guide]);
        setStatusMsg({ type: 'success', text: 'New guide registered successfully!' });
      }
      setGuideForm({ name: '', experience: '', description: '', imageUrl: '' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuide = async (id) => {
    if (!confirm('Are you sure you want to remove this guide from the directory?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/guides?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete guide.');

      setGuides((prev) => prev.filter((g) => g.id !== id));
      setStatusMsg({ type: 'success', text: 'Guide removed from directory.' });
      router.refresh();
    } catch (e) {
      setStatusMsg({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };

  // Lures Edit handlers
  const handleStartEditLure = (lure) => {
    setEditingLureId(lure.id);
    setLureForm({
      name: lure.name,
      price: lure.price.toString(),
      stockQty: lure.stock_qty ? lure.stock_qty.toString() : '20',
      imageUrl: lure.image_url || '',
      presetImage: '/assets/logo 1.jpeg'
    });
  };

  const handleCancelEditLure = () => {
    setEditingLureId(null);
    setLureForm({ name: '', price: '', stockQty: '', imageUrl: '', presetImage: '/assets/logo 1.jpeg' });
  };

  // Fish Species Edit handlers
  const handleStartEditFish = (fish) => {
    setEditingFishId(fish.id);
    setFishForm({
      name: fish.name,
      description: fish.description,
      imageUrl: fish.image_url || ''
    });
  };

  const handleCancelEditFish = () => {
    setEditingFishId(null);
    setFishForm({ name: '', description: '', imageUrl: '' });
  };

  // Damage Policy Edit handlers
  const handleStartEditPolicy = (policy) => {
    setEditingPolicyId(policy.id);
    setDamagePolicyForm({
      name: policy.name,
      price: policy.price.toString(),
      imageUrl: policy.image_url || ''
    });
  };

  const handleCancelEditPolicy = () => {
    setEditingPolicyId(null);
    setDamagePolicyForm({ name: '', price: '', imageUrl: '' });
  };

  // Fishing Spot Edit handlers
  const handleStartEditSpot = (spot, index) => {
    setEditingSpotIndex(index);
    setSpotForm({
      name: spot.name,
      terrain: spot.terrain || '',
      coordinates: spot.coordinates || '',
      description: spot.description,
      bestTime: spot.bestTime || '',
      lures: spot.lures || '',
      difficulty: spot.difficulty || 'Beginner',
      image: spot.image || ''
    });
  };

  const handleCancelEditSpot = () => {
    setEditingSpotIndex(null);
    setSpotForm({ name: '', terrain: '', coordinates: '', description: '', bestTime: '', lures: '', difficulty: 'Beginner', image: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen items-stretch relative overflow-x-hidden">
      
      {/* Mobile Top Navigation Header Bar */}
      <div className="lg:hidden w-full flex items-center justify-between bg-[#001418] border-b border-[#00B5AD]/15 px-4 py-3 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00B5AD] shadow-[0_0_10px_rgba(0,181,173,0.2)]">
            <img
              src="/assets/logo 1.jpeg"
              alt="Reel Problems Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[8px] font-black text-[#00B5AD] uppercase tracking-widest block leading-none mb-0.5">Control Center</span>
            <span className="text-[#FFFFFF] text-sm font-black font-['Outfit'] leading-none">REEL PROBLEMS</span>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg border border-[#00B5AD]/30 bg-[#04282F]/50 text-[#00B5AD] hover:bg-[#00B5AD]/10 transition-colors cursor-pointer"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#000000]/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation Drawer - Responsive & Attached to Left */}
      <div className={`fixed lg:static inset-y-0 left-0 w-80 flex flex-col bg-[#001418] border-r border-[#00B5AD]/15 p-6 flex-shrink-0 min-h-screen z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        {/* Sidebar Header — Logo + Brand */}
        <div className="pb-5 mb-4 border-b border-[#00B5AD]/10 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#00B5AD] shadow-[0_0_20px_rgba(0,181,173,0.25)] flex-shrink-0">
            <img
              src="/assets/logo 1.jpeg"
              alt="Reel Problems Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <span className="text-[10px] font-black text-[#00B5AD] uppercase tracking-widest block mb-0.5">Control Center</span>
            <h2 className="text-[#FFFFFF] text-lg font-black font-['Outfit']">REEL PROBLEMS</h2>
          </div>
        </div>

        {/* Container for menu items */}
        <div className="space-y-2 pr-1">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: <ShieldCheck className="w-5 h-5" /> },
          { id: 'rentals', label: 'Rental Management', icon: <ShoppingBag className="w-5 h-5" /> },
          { id: 'rentalGallery', label: 'Rental Gallery', icon: <Plus className="w-5 h-5" /> },
          { id: 'lures', label: 'Add-on Lures', icon: <ShoppingBag className="w-5 h-5" /> },
          { id: 'inventory', label: 'Gear Inventory', icon: <Anchor className="w-5 h-5" /> },
          { id: 'damagePolicies', label: 'Damage Gear Policies', icon: <AlertTriangle className="w-5 h-5" /> },
          { id: 'damages', label: 'Damage Reports', icon: <AlertTriangle className="w-5 h-5" /> },
          { id: 'guides', label: 'Guide Schedule', icon: <Calendar className="w-5 h-5" /> },
          { id: 'guidesManagement', label: 'Guides Directory', icon: <User className="w-5 h-5" /> },
          { id: 'fishSpeciesTab', label: 'Fish Directory', icon: <Fish className="w-5 h-5" /> },
          { id: 'fishingSpotsTab', label: 'Spot Directory', icon: <MapPin className="w-5 h-5" /> },
          { id: 'restaurantsTab', label: 'Dining Partners', icon: <Anchor className="w-5 h-5" /> },
          { id: 'cms', label: 'Content CMS Editor', icon: <Edit3 className="w-5 h-5" /> },
          { id: 'messages', label: 'Feedback Messages', icon: <Mail className="w-5 h-5" /> },
          { id: 'profile', label: 'My Profile', icon: <User className="w-5 h-5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              localStorage.setItem('adminActiveTab', tab.id);
              setStatusMsg({ type: null, text: '' });
              setIsSidebarOpen(false); // Auto close sidebar on click on mobile
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-lg text-sm font-extrabold uppercase tracking-wider text-left transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#00B5AD] text-[#FFFFFF] shadow-[0_4px_10px_rgba(0,181,173,0.2)]'
                : 'text-[#FFFFFF] hover:text-[#00B5AD] hover:bg-[#04282F]/60'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        </div>

        {/* Spacer to push logout to bottom */}
        <div className="flex-grow" />

        {/* Logout Button */}
        <div className="pt-4 mt-4 border-t border-[#00B5AD]/10">
          <button
            onClick={async () => {
              setIsSidebarOpen(false);
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider text-left transition-all cursor-pointer text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

      </div>

      {/* Main Panel Content Area - Pure White Background */}
      <div className="flex-grow bg-[#FFFFFF] p-6 sm:p-12 min-h-screen flex flex-col justify-between text-[#002830]">
        
        <div className="space-y-6">
          {statusMsg.text && (
            <div
              className={`p-4 rounded-xl text-xs font-bold ${
                statusMsg.type === 'success'
                  ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* VIEW 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Business Insights
              </h3>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-[#00B5AD]' },
                  { label: 'Total Bookings', value: totalBookingsCount, color: 'text-[#002830]' },
                  { label: 'Active Rentals', value: activeRentalsCount, color: 'text-[#00B5AD]' },
                  { label: 'Pending Returns', value: pendingReturnsCount, color: 'text-yellow-600' },
                  { label: 'Late Returns', value: lateReturnsCount, color: 'text-red-500' },
                  { label: 'Damage Incidents', value: damagesCount, color: 'text-red-500' },
                  { label: 'Guide Excursions', value: guideBookingsCount, color: 'text-[#002830]' },
                  { label: 'Poles Available', value: `${availablePoles} / 20`, color: 'text-[#00B5AD]' }
                ].map((kpi, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-1.5 shadow-sm">
                    <span className="block text-[9px] font-black text-[#6B7A82] uppercase tracking-wider">{kpi.label}</span>
                    <span className={`text-2xl font-black font-['Outfit'] ${kpi.color}`}>{kpi.value}</span>
                  </div>
                ))}
              </div>

              {/* Quick Bookings Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830]">Recent Reservations</h4>
                <div className="overflow-x-auto rounded-xl border border-[#00B5AD]/20 bg-white shadow-sm">
                  <table className="w-full text-left text-[11px] font-semibold text-[#002830]">
                    <thead className="bg-[#04282F] text-[#FFFFFF] text-[9px] font-black uppercase tracking-wider border-b border-[#00B5AD]/20">
                      <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Package Type</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00B5AD]/10">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-[#00B5AD]/5">
                          <td className="px-4 py-2.5 font-mono text-[#002830] font-bold">{b.id.slice(0,6).toUpperCase()}</td>
                          <td className="px-4 py-2.5 text-[#002830]">{b.full_name || 'Customer'}</td>
                          <td className="px-4 py-2.5 text-[#002830]">{b.guide_booked ? 'Guided Charter' : `${b.pole_quantity} Poles Rental`}</td>
                          <td className="px-4 py-2.5 text-[#00B5AD] font-bold">${b.total_price}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase border-[#00B5AD]/25 text-[#00B5AD]">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: RENTAL MANAGEMENT */}
          {activeTab === 'rentals' && (
            <div className="space-y-6 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Rental Logs Manager
              </h3>

              <div className="overflow-x-auto rounded-xl border border-[#00B5AD]/20 bg-white shadow-sm">
                <table className="w-full text-left text-[11px] font-semibold text-[#002830]">
                  <thead className="bg-[#04282F] text-[#FFFFFF] text-[9px] font-black uppercase tracking-wider border-b border-[#00B5AD]/20">
                    <tr>
                      <th className="px-4 py-4">Booking ID</th>
                      <th className="px-4 py-4">Client Contact</th>
                      <th className="px-4 py-4">Booking Specs</th>
                      <th className="px-4 py-4">Pickup Address</th>
                      <th className="px-4 py-4">Total Fee</th>
                      <th className="px-4 py-4">Current Status</th>
                      <th className="px-4 py-4 text-center">Manage Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00B5AD]/10">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#00B5AD]/5">
                        <td className="px-4 py-3 font-mono text-[#002830] font-bold">
                          {b.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 leading-relaxed">
                          <span className="block text-[#002830] font-bold">{b.full_name}</span>
                          <span className="block text-[9px] text-[#6B7A82]">{b.email}</span>
                        </td>
                        <td className="px-4 py-3">
                          {b.guide_booked ? (
                            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">Guided Trip</span>
                          ) : (
                            <span className="block text-xs text-[#002830]">{b.pole_quantity} Poles • {b.rental_duration} Days</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="block text-xs text-[#002830] max-w-[140px]">{b.pickup_address || <span className="text-[#6B7A82] italic">Not provided</span>}</span>
                        </td>
                        <td className="px-4 py-3 text-[#00B5AD] font-black">
                          ${b.total_price}
                        </td>
                        <td className="px-4 py-3">
                          <select
                             value={b.status}
                             disabled={loading}
                             onChange={(e) => handleStatusChange(b.id, e.target.value)}
                             className="bg-white border border-[#00B5AD]/30 text-[#00B5AD] text-[10px] font-bold uppercase rounded-md p-1.5 outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="active">Active</option>
                            <option value="returned">Returned</option>
                            <option value="late_return">Late Return</option>
                            <option value="damaged">Damaged</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="text-[#00B5AD] bg-[#00B5AD]/10 hover:bg-[#00B5AD] hover:text-white border border-[#00B5AD]/20 rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: RENTAL GALLERY MANAGEMENT */}
          {activeTab === 'rentalGallery' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Rental Gallery Manager
              </h3>
              <p className="text-xs text-[#6B7A82] font-semibold -mt-4">
                Upload photos of your fishing poles, tackle boxes, and rental area. These appear on the public rentals page for customers to see.
              </p>

              {/* Upload Form */}
              <div className="p-6 rounded-xl border border-[#00B5AD]/20 bg-[#0A424A]/5 space-y-4">
                <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                  Upload New Photo
                </h4>

                {/* Image File Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-wider">Select Image File</label>
                  <input
                    id="gallery-file-input"
                    type="file"
                    accept="image/*"
                    className="w-full text-xs text-[#002830] bg-white border border-[#00B5AD]/20 rounded-lg px-3 py-2.5 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#00B5AD] file:text-white file:font-bold file:text-xs file:cursor-pointer cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setGalleryUploading(true);
                      setStatusMsg({ type: null, text: '' });
                      try {
                        const compressed = await compressImage(file, 1200, 0.80);
                        const fd = new FormData();
                        fd.append('file', compressed);
                        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Upload failed');
                        setGalleryForm(prev => ({ ...prev, url: data.url }));
                        setStatusMsg({ type: 'success', text: 'Image uploaded! Add a caption and click Save.' });
                      } catch (err) {
                        setStatusMsg({ type: 'error', text: err.message });
                      } finally {
                        setGalleryUploading(false);
                      }
                    }}
                  />
                  {galleryUploading && (
                    <div className="flex items-center gap-2 text-[#00B5AD] text-xs font-bold">
                      <div className="w-3 h-3 border-2 border-[#00B5AD] border-t-transparent rounded-full animate-spin" />
                      Uploading image...
                    </div>
                  )}
                  {galleryForm.url && !galleryUploading && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-[#00B5AD]/25 shadow-sm">
                      <img src={galleryForm.url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#6B7A82] uppercase tracking-wider">Caption / Label (Optional)</label>
                  <input
                    type="text"
                    value={galleryForm.caption}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="e.g. Fishing Poles, Tackle Box, Rental Area"
                    className="w-full bg-white border border-[#00B5AD]/25 rounded-lg px-3 py-2.5 text-xs text-[#002830] outline-none focus:border-[#00B5AD]"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  disabled={!galleryForm.url || loading}
                  onClick={async () => {
                    if (!galleryForm.url) return;
                    setLoading(true);
                    setStatusMsg({ type: null, text: '' });
                    try {
                      const newImage = { url: galleryForm.url, caption: galleryForm.caption.trim() };
                      const updated = [...rentalGallery, newImage];
                      const res = await fetch('/api/admin/rental-gallery', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ images: updated })
                      });
                      if (!res.ok) throw new Error('Failed to save gallery');
                      setRentalGallery(updated);
                      setGalleryForm({ caption: '', url: '' });
                      document.getElementById('gallery-file-input').value = '';
                      setStatusMsg({ type: 'success', text: 'Photo added to gallery successfully!' });
                    } catch (err) {
                      setStatusMsg({ type: 'error', text: err.message });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex items-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/40 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Save Photo to Gallery
                </button>
              </div>

              {/* Gallery Grid */}
              {rentalGallery.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#00B5AD]/20 rounded-xl">
                  <p className="text-xs font-semibold text-[#6B7A82]">No photos in gallery yet. Upload your first photo above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-[#002830]">
                    Current Gallery ({rentalGallery.length} {rentalGallery.length === 1 ? 'Photo' : 'Photos'})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rentalGallery.map((img, idx) => (
                      <div key={idx} className="rounded-xl border border-[#00B5AD]/15 overflow-hidden bg-white shadow-sm">
                        {/* Image */}
                        <div className="aspect-video bg-gray-100 relative">
                          <img src={img.url} alt={img.caption || `Gallery ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                        {/* Caption + Actions */}
                        <div className="p-3 space-y-2">
                          {editingGalleryIdx === idx ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingGalleryCaption}
                                onChange={(e) => setEditingGalleryCaption(e.target.value)}
                                className="flex-1 bg-white border border-[#00B5AD]/30 rounded-md px-2 py-1 text-xs text-[#002830] outline-none"
                                placeholder="Caption..."
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  setLoading(true);
                                  try {
                                    const updated = rentalGallery.map((item, i) =>
                                      i === idx ? { ...item, caption: editingGalleryCaption.trim() } : item
                                    );
                                    const res = await fetch('/api/admin/rental-gallery', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ images: updated })
                                    });
                                    if (!res.ok) throw new Error('Save failed');
                                    setRentalGallery(updated);
                                    setEditingGalleryIdx(null);
                                    setStatusMsg({ type: 'success', text: 'Caption updated!' });
                                  } catch (err) {
                                    setStatusMsg({ type: 'error', text: err.message });
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="bg-[#00B5AD] text-white text-[9px] font-bold px-2 py-1 rounded-md cursor-pointer"
                              >Save</button>
                              <button
                                type="button"
                                onClick={() => setEditingGalleryIdx(null)}
                                className="border border-gray-300 text-[#6B7A82] text-[9px] font-bold px-2 py-1 rounded-md cursor-pointer"
                              >✕</button>
                            </div>
                          ) : (
                            <p className="text-xs font-semibold text-[#002830] truncate">
                              {img.caption || <span className="text-[#6B7A82] italic">No caption</span>}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGalleryIdx(idx);
                                setEditingGalleryCaption(img.caption || '');
                              }}
                              className="flex-1 border border-[#00B5AD]/30 text-[#00B5AD] hover:bg-[#00B5AD]/10 text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md cursor-pointer transition-all"
                            >
                              Edit Caption
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={async () => {
                                if (!confirm('Delete this photo from gallery?')) return;
                                setLoading(true);
                                try {
                                  const updated = rentalGallery.filter((_, i) => i !== idx);
                                  const res = await fetch('/api/admin/rental-gallery', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ images: updated })
                                  });
                                  if (!res.ok) throw new Error('Delete failed');
                                  setRentalGallery(updated);
                                  setStatusMsg({ type: 'success', text: 'Photo removed from gallery.' });
                                } catch (err) {
                                  setStatusMsg({ type: 'error', text: err.message });
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="border border-red-400/40 text-red-500 hover:bg-red-50 text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md cursor-pointer transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW X: LURES MANAGEMENT */}
          {activeTab === 'lures' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Add-on Lures Manager
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - Left */}
                <form onSubmit={handleAddLure} className="lg:col-span-5 p-6 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    {editingLureId ? `Edit Lure: ${lureForm.name}` : 'Register New Island Lure'}
                  </h4>

                  {/* Lure Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Lure Name</label>
                    <input
                      type="text"
                      required
                      value={lureForm.name}
                      onChange={(e) => setLureForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Blue Marlin Jig"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Lure Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Lure Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={lureForm.price}
                      onChange={(e) => setLureForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 14.99"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Lure Initial Stock */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Initial Stocks (Qty)</label>
                    <input
                      type="number"
                      required
                      value={lureForm.stockQty}
                      onChange={(e) => setLureForm(prev => ({ ...prev, stockQty: e.target.value }))}
                      placeholder="e.g. 20"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Lure Image File Upload (Base64) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Upload Lure Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2 text-xs text-[#002830] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#00B5AD]/15 file:text-[#00B5AD] file:cursor-pointer hover:file:bg-[#00B5AD]/25"
                    />
                  </div>

                  {/* Image URL Input (Fallback) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Or Paste Image URL</label>
                    <input
                      type="text"
                      value={lureForm.imageUrl}
                      onChange={(e) => setLureForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="e.g. https://example.com/lure.png"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Preview Image Badge */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#00B5AD]/20 bg-white flex items-center justify-center flex-shrink-0">
                      <img
                        src={lureForm.imageUrl || lureForm.presetImage}
                        alt="Lure Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/logo 1.jpeg';
                        }}
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-[#6B7A82] uppercase">Live Preview</span>
                      <span className="block text-[10px] font-bold text-[#00B5AD]">Will display in User Rentals Catalog</span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_10px_rgba(0,181,173,0.15)]"
                    >
                      {editingLureId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingLureId ? 'Save Lure Changes' : 'Register Add-on Lure'}
                    </button>
                    {editingLureId && (
                      <button
                        type="button"
                        onClick={handleCancelEditLure}
                        className="bg-gray-500/10 border border-gray-500/20 text-gray-700 hover:bg-gray-500 hover:text-white px-4 py-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Catalog Grid Column - Right */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    Current Active Add-on Lures ({lures.length})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {lures.map((lure) => (
                      <div key={lure.id} className="p-4 rounded-xl border border-[#00B5AD]/20 bg-white flex flex-col justify-between shadow-sm relative group overflow-hidden">
                        
                        {/* Actions overlay buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <button
                            type="button; cursor-pointer"
                            onClick={() => handleStartEditLure(lure)}
                            className="p-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/20 text-[#00B5AD] hover:bg-[#00B5AD] hover:text-white transition-all cursor-pointer"
                            title="Edit Lure"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLure(lure.id)}
                            className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Remove Lure"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Image Box */}
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-[#00B5AD]/10 bg-white flex items-center justify-center">
                            <img
                              src={lure.image_url || '/assets/logo 1.jpeg'}
                              alt={lure.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = '/assets/logo 1.jpeg';
                              }}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-[#6B7A82] uppercase">LURE ID #{lure.id}</span>
                            <h5 className="text-xs font-black text-[#002830] font-['Outfit'] line-clamp-1">{lure.name}</h5>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#00B5AD]/10 flex justify-between items-baseline">
                          <span className="text-[9px] font-black text-[#6B7A82] uppercase">Rent Price</span>
                          <span className="text-sm font-black text-[#00B5AD] font-['Outfit']">${parseFloat(lure.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW X: DAMAGE GEAR POLICIES MANAGEMENT */}
          {activeTab === 'damagePolicies' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Damage Gear Policies Manager
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - Left */}
                <div className="lg:col-span-5 flex flex-col space-y-8">
                  <form onSubmit={handleAddDamagePolicy} className="p-6 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    {editingPolicyId ? `Edit Policy: ${damagePolicyForm.name}` : 'Register New Damage Gear Item'}
                  </h4>

                  {/* Policy Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Incident Name / Classification</label>
                    <input
                      type="text"
                      required
                      value={damagePolicyForm.name}
                      onChange={(e) => setDamagePolicyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Lost rigging Pliers"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Policy Fine Fee */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Standard Fine Fee ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={damagePolicyForm.price}
                      onChange={(e) => setDamagePolicyForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 50.00"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Image File Upload (Base64) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Upload Gear Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDamagePolicyImageChange}
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2 text-xs text-[#002830] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#00B5AD]/15 file:text-[#00B5AD] file:cursor-pointer hover:file:bg-[#00B5AD]/25"
                    />
                  </div>

                  {/* Live Preview Image Badge */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#00B5AD]/20 bg-white flex items-center justify-center flex-shrink-0">
                      {damagePolicyForm.imageUrl ? (
                        <img
                          src={damagePolicyForm.imageUrl}
                          alt="Lure Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-[#6B7A82] uppercase">Live Preview</span>
                      <span className="block text-[10px] font-bold text-[#00B5AD]">Will display in User Policies page</span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_10px_rgba(0,181,173,0.15)]"
                    >
                      {editingPolicyId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingPolicyId ? 'Save Policy Changes' : 'Register Damage Policy'}
                    </button>
                    {editingPolicyId && (
                      <button
                        type="button"
                        onClick={handleCancelEditPolicy}
                        className="bg-gray-500/10 border border-gray-500/20 text-gray-700 hover:bg-gray-500 hover:text-white px-4 py-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* --- SEPARATE SECTION: GENERAL BROKEN IMAGES --- */}
                <div className="bg-[#00B5AD]/5 border border-[#00B5AD]/20 rounded-xl p-6 mt-8">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830] mb-4">
                    General Broken Images Gallery
                  </h4>
                  <p className="text-xs text-[#6B7A82] mb-4">Upload illustrative broken gear images without assigning a price. These will show on the User Policies page.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Upload Images (Multiple) {uploadingImage && '(Uploading...)'}</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGeneralBrokenImagesUpload}
                        disabled={uploadingImage}
                        className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2 text-xs text-[#002830] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#00B5AD]/10 file:text-[#00B5AD] file:cursor-pointer hover:file:bg-[#00B5AD]/20 disabled:opacity-50"
                      />
                    </div>

                    {generalBrokenImages && generalBrokenImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        {generalBrokenImages.map((img, idx) => (
                          <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-red-500/20 relative group">
                            <img src={img} alt="Broken preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleDeleteGeneralBrokenImage(img)}
                              className="absolute inset-0 bg-red-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </div> {/* End of Left Column Container */}

                {/* Catalog Grid Column - Right */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    Current Damage Policies ({damagePolicies.length})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {damagePolicies.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl border border-[#00B5AD]/20 bg-white flex flex-col justify-between shadow-sm relative group overflow-hidden">
                        {/* Actions overlay buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <button
                            type="button"
                            onClick={() => handleStartEditPolicy(p)}
                            className="p-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/20 text-[#00B5AD] hover:bg-[#00B5AD] hover:text-white transition-all cursor-pointer"
                            title="Edit Policy"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDamagePolicy(p.id)}
                            className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Remove Damage Policy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Image Box */}
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/5 flex items-center justify-center">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <AlertTriangle className="w-8 h-8 text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-[#6B7A82] uppercase">POLICY ID #{p.id}</span>
                            <h5 className="text-xs font-black text-[#002830] font-['Outfit'] line-clamp-2 leading-tight">{p.name}</h5>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#00B5AD]/10 flex justify-between items-baseline">
                          <span className="text-[9px] font-black text-[#6B7A82] uppercase">Fine Fee</span>
                          <span className="text-sm font-black text-red-500 font-['Outfit']">${parseFloat(p.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Gear Inventory Controller
              </h3>

              {/* Add New Inventory Form */}
              <form onSubmit={handleAddInventory} className="p-6 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-4 max-w-2xl">
                <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                  Register New Gear Item
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Item Name</label>
                    <input
                      type="text"
                      required
                      value={inventoryForm.itemName}
                      onChange={(e) => setInventoryForm(prev => ({ ...prev, itemName: e.target.value }))}
                      placeholder="e.g. Fishing Nets"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Initial Total Stock (Qty)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={inventoryForm.totalQty}
                      onChange={(e) => setInventoryForm(prev => ({ ...prev, totalQty: e.target.value }))}
                      placeholder="e.g. 10"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00B5AD] hover:bg-[#00908A] disabled:bg-[#00B5AD]/50 text-white font-extrabold uppercase py-2.5 rounded-lg tracking-wider transition-all text-xs"
                >
                  {loading ? 'Adding Item...' : 'Register Item'}
                </button>
              </form>

              {/* General Stock list */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-[#002830] tracking-wider">General Gear Stock Levels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#00B5AD]/20 bg-[#0A424A]/5 p-5 shadow-sm space-y-4 text-[#002830] relative group"
                    >
                      {/* Delete absolute button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteInventory(item.id)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md z-10"
                        title="Remove Inventory Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex justify-between items-center border-b border-[#00B5AD]/10 pb-2">
                        <h4 className="font-extrabold text-[#002830] text-sm">{item.item_name}</h4>
                        <span className="text-[#00B5AD] font-bold text-xs">
                          {item.available_qty} / {item.total_qty} Avail
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-[#6B7A82]">
                        <span>Damaged: {item.damaged_qty}</span>
                        <span>Missing: {item.missing_qty}</span>
                      </div>

                      {/* Manual Restock buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestock(item.item_name, 1)}
                          className="flex-grow bg-[#00B5AD]/10 hover:bg-[#00B5AD] hover:text-white border border-[#00B5AD]/20 text-[#00B5AD] py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                        >
                          +1 Restock
                        </button>
                        <button
                          onClick={() => handleRestock(item.item_name, 5)}
                          className="flex-grow bg-[#00B5AD]/10 hover:bg-[#00B5AD] hover:text-white border border-[#00B5AD]/20 text-[#00B5AD] py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                        >
                          +5 Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-on Lures Stock list */}
              <div className="space-y-4 pt-6">
                <h4 className="text-xs font-black uppercase text-[#002830] tracking-wider">Add-on Lures Stock Levels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lures.map((lure) => (
                    <div
                      key={`lure-inv-${lure.id}`}
                      className="rounded-xl border border-[#00B5AD]/20 bg-[#0A424A]/5 p-5 shadow-sm space-y-4 text-[#002830]"
                    >
                      <div className="flex justify-between items-center border-b border-[#00B5AD]/10 pb-2">
                        <h4 className="font-extrabold text-[#002830] text-sm">{lure.name}</h4>
                        <span className="text-[#00B5AD] font-bold text-xs">
                          {lure.stock_qty} / {lure.total_qty || lure.stock_qty} Avail
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-[#6B7A82]">
                        <span>Damaged: {lure.damaged_qty || 0}</span>
                        <span>Missing: {lure.missing_qty || 0}</span>
                      </div>

                      {/* Manual Restock buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestockLure(lure.id, 1)}
                          className="flex-grow bg-[#00B5AD]/10 hover:bg-[#00B5AD] hover:text-white border border-[#00B5AD]/20 text-[#00B5AD] py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                        >
                          +1 Restock
                        </button>
                        <button
                          onClick={() => handleRestockLure(lure.id, 5)}
                          className="flex-grow bg-[#00B5AD]/10 hover:bg-[#00B5AD] hover:text-white border border-[#00B5AD]/20 text-[#00B5AD] py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all"
                        >
                          +5 Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: DAMAGE MANAGEMENT */}
          {activeTab === 'damages' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Damage Incident Logger
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to log damage */}
                <form onSubmit={handleAddDamage} className="lg:col-span-5 bg-[#0A424A]/5 border border-[#00B5AD]/20 p-6 rounded-2xl space-y-4 text-xs font-semibold text-[#002830]">
                  <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830] border-b border-[#00B5AD]/20 pb-2 mb-2">
                    Create Incident File
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Attach Booking Reference</label>
                    <select
                      value={damageForm.bookingId}
                      required
                      onChange={(e) => setDamageForm((prev) => ({ ...prev, bookingId: e.target.value }))}
                      className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                    >
                      <option value="">-- Pick Customer Booking --</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.full_name} ({b.id.slice(0,6).toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Damage Classification</label>
                    <select
                      value={damageForm.type}
                      required
                      onChange={(e) => setDamageForm((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                    >
                      <option value="">-- Select Damage Classification --</option>
                      {damagePolicies.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} (${parseFloat(p.price).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Damage Description</label>
                    <textarea
                      value={damageForm.description}
                      onChange={(e) => setDamageForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g. Returned rod snapped in half at middle ferrule eye..."
                      rows="3"
                      className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] placeholder-[#6B7A82] rounded-lg px-3 py-2.5 outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-[#FFFFFF] font-extrabold uppercase py-3 rounded-lg tracking-wider cursor-pointer shadow-md transition-all"
                  >
                    {loading ? 'Filing Report...' : 'Log & Apply Fine'}
                  </button>
                </form>

                {/* List of active damages */}
                <div className="lg:col-span-7 space-y-4 text-[#002830]">
                  <h4 className="text-xs font-black uppercase text-[#002830] tracking-wider">Active Damage Files</h4>
                  
                  {damages.length === 0 ? (
                    <p className="text-[11px] font-semibold text-[#6B7A82]">No damage incidents logged currently.</p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      {damages.map((dmg) => (
                        <div
                          key={dmg.id}
                          className="rounded-xl border border-red-500/25 bg-red-500/5 p-4 flex justify-between gap-4 text-xs font-semibold"
                        >
                          <div className="space-y-1 text-red-600">
                            <span className="block text-[9px] text-[#6B7A82] uppercase tracking-wider">Booking Ref: {dmg.booking_id.slice(0,6).toUpperCase()}</span>
                            <h5 className="font-extrabold text-[#002830]">{dmg.damage_type}</h5>
                            <p className="text-[11px] text-[#002830]/80 italic font-medium">"{dmg.description || 'No notes added.'}"</p>
                          </div>
                          <div className="text-right flex flex-col justify-between items-end">
                            <span className="text-red-600 font-extrabold text-sm">${dmg.fee_applied}</span>
                            <span className="text-[9px] bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full uppercase">
                              {dmg.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* VIEW 5: GUIDE SCHEDULE */}
          {activeTab === 'guides' && (
            <div className="space-y-6 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Guided Excursion Time Slots
              </h3>

              <div className="overflow-x-auto rounded-xl border border-[#00B5AD]/20 bg-white shadow-sm">
                <table className="w-full text-left text-[11px] font-semibold text-[#002830]">
                  <thead className="bg-[#04282F] text-[#FFFFFF] text-[9px] font-black uppercase tracking-wider border-b border-[#00B5AD]/20">
                    <tr>
                      <th className="px-4 py-4">Excursion Date</th>
                      <th className="px-4 py-4">Customer Name</th>
                      <th className="px-4 py-4">Hours Booked</th>
                      <th className="px-4 py-4">Pickup Point Address</th>
                      <th className="px-4 py-4">Billing Fee</th>
                      <th className="px-4 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00B5AD]/10">
                    {bookings
                      .filter((b) => b.guide_booked)
                      .map((g) => (
                        <tr key={g.id} className="hover:bg-[#00B5AD]/5">
                          <td className="px-4 py-3 font-mono text-[#002830] font-bold">
                            {new Date(g.guide_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-4 py-3 text-[#002830] font-bold">{g.full_name}</td>
                          <td className="px-4 py-3 text-[#002830]">{g.guide_hours} Hours Excursion</td>
                          <td className="px-4 py-3 text-[#00B5AD]">{g.guide_pickup_location}</td>
                          <td className="px-4 py-3 font-black text-[#002830]">${g.total_price}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase border-[#00B5AD]/30 text-[#00B5AD]">
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: GUIDES MANAGEMENT (CRUD) */}
          {activeTab === 'guidesManagement' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Guides Directory Manager
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - Left */}
                <form onSubmit={handleAddGuide} className="lg:col-span-5 p-6 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    {editingGuideId ? `Edit Guide: ${guideForm.name}` : 'Register New Fishing Guide'}
                  </h4>

                  {/* Guide Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Guide Name</label>
                    <input
                      type="text"
                      required
                      value={guideForm.name}
                      onChange={(e) => setGuideForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Capt. Dan"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Experience Badge */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Years / Type Experience Badge</label>
                    <input
                      type="text"
                      value={guideForm.experience}
                      onChange={(e) => setGuideForm(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g. 15+ Yrs Exp"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Description / Bio */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Short Description / Bio Tagline</label>
                    <textarea
                      value={guideForm.description}
                      onChange={(e) => setGuideForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe guide specialty, certifications..."
                      rows="3"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors resize-none"
                    />
                  </div>

                  {/* Upload Avatar */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Upload Guide Avatar Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGuideImageChange}
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2 text-xs text-[#002830] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#00B5AD]/15 file:text-[#00B5AD] file:cursor-pointer hover:file:bg-[#00B5AD]/25"
                    />
                  </div>

                  {/* Paste Avatar URL Fallback */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Or Paste Image URL</label>
                    <input
                      type="text"
                      value={guideForm.imageUrl}
                      onChange={(e) => setGuideForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="e.g. /assets/logo 1.jpeg"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Live Preview Avatar */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-[#00B5AD]/20 bg-white flex items-center justify-center flex-shrink-0">
                      {guideForm.imageUrl ? (
                        <img
                          src={guideForm.imageUrl}
                          alt="Guide Avatar Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/assets/logo 1.jpeg'; }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#00B5AD]" />
                      )}
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-[#6B7A82] uppercase">Avatar Live Preview</span>
                      <span className="block text-[10px] font-bold text-[#00B5AD]">Will display in booking dropdowns</span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_10px_rgba(0,181,173,0.15)]"
                    >
                      {editingGuideId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingGuideId ? 'Save Guide Changes' : 'Register Guide'}
                    </button>
                    {editingGuideId && (
                      <button
                        type="button"
                        onClick={handleCancelEditGuide}
                        className="bg-gray-500/10 border border-gray-500/20 text-gray-700 hover:bg-gray-500 hover:text-white px-4 py-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Catalog Grid Column - Right */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    Current Guides Directory ({guides.length})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {guides.map((guide) => (
                      <div key={guide.id} className="p-4 rounded-xl border border-[#00B5AD]/20 bg-white flex flex-col justify-between shadow-sm relative group overflow-hidden">
                        
                        {/* Hover Actions Menu */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <button
                            type="button"
                            onClick={() => handleStartEditGuide(guide)}
                            className="p-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/20 text-[#00B5AD] hover:bg-[#00B5AD] hover:text-white transition-all cursor-pointer"
                            title="Edit Guide"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGuide(guide.id)}
                            className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Remove Guide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3 flex flex-col items-center text-center">
                          {/* Circle Avatar Box */}
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#00B5AD]/20 bg-white flex items-center justify-center flex-shrink-0 shadow-inner">
                            <img
                              src={guide.image_url || '/assets/logo 1.jpeg'}
                              alt={guide.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => { e.target.src = '/assets/logo 1.jpeg'; }}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[8px] font-black text-[#00B5AD] bg-[#00B5AD]/10 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
                              {guide.experience || 'Charter Pro'}
                            </span>
                            <h5 className="text-xs font-black text-[#002830] font-['Outfit']">{guide.name}</h5>
                            <p className="text-[10px] text-[#6B7A82] line-clamp-2 leading-relaxed">{guide.description || 'St. Thomas Angling Expert'}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#00B5AD]/10 text-center">
                          <span className="text-[8px] font-black text-gray-400 uppercase">Guide ID #{guide.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: FEEDBACK MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Support Feedback Logs
              </h3>

              {messages.length === 0 ? (
                <p className="text-xs font-semibold text-[#6B7A82]">No contact feedback messages logged.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-[#00B5AD]/20 bg-[#0A424A]/5 p-5 shadow-sm space-y-3 text-xs font-semibold text-[#002830]"
                    >
                      <div className="flex justify-between border-b border-[#00B5AD]/10 pb-2">
                        <div>
                          <h4 className="font-extrabold text-[#002830] text-sm leading-none mb-1">{msg.name}</h4>
                          <span className="text-[10px] text-[#6B7A82]">{msg.email} • {msg.phone || 'No phone'}</span>
                        </div>
                        <span className="text-[9px] text-[#3B4E5A] font-mono">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#002830] italic font-medium leading-relaxed bg-white border border-[#00B5AD]/20 p-3 rounded-lg">
                        "{msg.message}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: FISH SPECIES MANAGEMENT */}
          {activeTab === 'fishSpeciesTab' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Fish Species Directory Manager
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - Left */}
                <form onSubmit={handleAddFish} className="lg:col-span-5 p-6 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    {editingFishId ? `Edit Fish: ${fishForm.name}` : 'Register New Game Fish'}
                  </h4>

                  {/* Fish Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Fish Species Name</label>
                    <input
                      type="text"
                      required
                      value={fishForm.name}
                      onChange={(e) => setFishForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Snook (Common)"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Fish Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Description</label>
                    <textarea
                      required
                      value={fishForm.description}
                      onChange={(e) => setFishForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the fish species, habitat, fighting style..."
                      rows="4"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors resize-none"
                    />
                  </div>

                  {/* Fish Image File Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Upload Fish Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFishImageChange}
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2 text-xs text-[#002830] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#00B5AD]/15 file:text-[#00B5AD] file:cursor-pointer hover:file:bg-[#00B5AD]/25"
                    />
                  </div>

                  {/* Image URL Fallback */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Or Paste Image URL</label>
                    <input
                      type="text"
                      value={fishForm.imageUrl}
                      onChange={(e) => setFishForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="e.g. https://example.com/fish.png"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Preview Image Badge */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#00B5AD]/20 bg-white flex items-center justify-center flex-shrink-0">
                      {fishForm.imageUrl ? (
                        <img
                          src={fishForm.imageUrl}
                          alt="Fish Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/assets/logo 1.jpeg'; }}
                        />
                      ) : (
                        <Fish className="w-6 h-6 text-[#00B5AD]" />
                      )}
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-[#6B7A82] uppercase">Live Preview</span>
                      <span className="block text-[10px] font-bold text-[#00B5AD]">Will display on Fish Species Page</span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_10px_rgba(0,181,173,0.15)]"
                    >
                      {editingFishId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingFishId ? 'Save Fish Changes' : 'Register Game Fish'}
                    </button>
                    {editingFishId && (
                      <button
                        type="button"
                        onClick={handleCancelEditFish}
                        className="bg-gray-500/10 border border-gray-500/20 text-gray-700 hover:bg-gray-500 hover:text-white px-4 py-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Catalog Grid Column - Right */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    Current Fish Directory ({fishSpecies.length})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {fishSpecies.map((fish) => (
                      <div key={fish.id} className="p-4 rounded-xl border border-[#00B5AD]/20 bg-white flex flex-col justify-between shadow-sm relative group overflow-hidden">
                        
                        {/* Actions overlay buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <button
                            type="button"
                            onClick={() => handleStartEditFish(fish)}
                            className="p-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/20 text-[#00B5AD] hover:bg-[#00B5AD] hover:text-white transition-all cursor-pointer"
                            title="Edit Fish"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFish(fish.id)}
                            className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Remove Fish Species"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Image Box */}
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-[#00B5AD]/10 bg-[#04282F]/5 flex items-center justify-center">
                            {fish.image_url ? (
                              <img
                                src={fish.image_url}
                                alt={fish.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => { e.target.src = '/assets/logo 1.jpeg'; }}
                              />
                            ) : (
                              <Fish className="w-8 h-8 text-[#00B5AD]/60" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-[#6B7A82] uppercase">FISH ID #{fish.id}</span>
                            <h5 className="text-xs font-black text-[#002830] font-['Outfit'] line-clamp-1">{fish.name}</h5>
                            <p className="text-[10px] text-[#6B7A82] line-clamp-2 leading-relaxed">{fish.description}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#00B5AD]/10 flex items-center gap-1">
                          <span className="text-[9px] font-black text-[#00B5AD] uppercase border border-[#00B5AD]/20 px-2 py-0.5 rounded-full">Game Fish</span>
                          <span className="text-[9px] font-black text-[#6B7A82] uppercase border border-[#6B7A82]/20 px-2 py-0.5 rounded-full">Shoreline</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: FISHING SPOTS MANAGEMENT */}
          {activeTab === 'fishingSpotsTab' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Fishing Spots Directory Manager
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Column - Left */}
                <form onSubmit={handleAddSpot} className="lg:col-span-5 p-6 rounded-xl border border-[#00B5AD]/25 bg-[#0A424A]/5 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    {editingSpotIndex !== null ? `Edit Spot: ${spotForm.name}` : 'Register New Fishing Hotspot'}
                  </h4>

                  {/* Spot Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Spot Name</label>
                    <input
                      type="text"
                      required
                      value={spotForm.name}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Hull Bay Rock Points"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Terrain */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Terrain Type</label>
                    <input
                      type="text"
                      value={spotForm.terrain}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, terrain: e.target.value }))}
                      placeholder="e.g. Rocky shoreline, shallow flats"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">GPS Coordinates</label>
                    <input
                      type="text"
                      value={spotForm.coordinates}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, coordinates: e.target.value }))}
                      placeholder="e.g. 18.3711° N, 64.9542° W"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Spot Description</label>
                    <textarea
                      required
                      value={spotForm.description}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what makes this spot unique, what fish are found here..."
                      rows="3"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors resize-none"
                    />
                  </div>

                  {/* Best Time & Difficulty in Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Best Time</label>
                      <input
                        type="text"
                        value={spotForm.bestTime}
                        onChange={(e) => setSpotForm(prev => ({ ...prev, bestTime: e.target.value }))}
                        placeholder="e.g. Early Morning"
                        className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Difficulty Level</label>
                      <select
                        value={spotForm.difficulty}
                        onChange={(e) => setSpotForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] outline-none focus:border-[#00B5AD] transition-colors"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Beginner-Intermediate">Beginner-Intermediate</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Advanced (Slippery rocks)">Advanced (Slippery rocks)</option>
                      </select>
                    </div>
                  </div>

                  {/* Recommended Lures */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Recommended Lures</label>
                    <input
                      type="text"
                      value={spotForm.lures}
                      onChange={(e) => setSpotForm(prev => ({ ...prev, lures: e.target.value }))}
                      placeholder="e.g. Crystal Minnow, Popper"
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2.5 text-xs text-[#002830] placeholder-[#6B7A82]/50 outline-none focus:border-[#00B5AD] transition-colors"
                    />
                  </div>

                  {/* Spot Image File Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#6B7A82] uppercase tracking-wider block">Upload Spot Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSpotImageChange}
                      className="w-full bg-white border border-[#00B5AD]/30 rounded-lg p-2 text-xs text-[#002830] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#00B5AD]/15 file:text-[#00B5AD] file:cursor-pointer hover:file:bg-[#00B5AD]/25"
                    />
                  </div>

                  {/* Preview */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#00B5AD]/20 bg-white flex items-center justify-center flex-shrink-0">
                      {spotForm.image ? (
                        <img
                          src={spotForm.image}
                          alt="Spot Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MapPin className="w-6 h-6 text-[#00B5AD]" />
                      )}
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-[#6B7A82] uppercase">Live Preview</span>
                      <span className="block text-[10px] font-bold text-[#00B5AD]">Will display on Fishing Spots Page</span>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00A39E] text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_10px_rgba(0,181,173,0.15)]"
                    >
                      {editingSpotIndex !== null ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingSpotIndex !== null ? 'Save Spot Changes' : 'Register Fishing Spot'}
                    </button>
                    {editingSpotIndex !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEditSpot}
                        className="bg-gray-500/10 border border-gray-500/20 text-gray-700 hover:bg-gray-500 hover:text-white px-4 py-3 rounded-lg text-xs font-black uppercase transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Spots Catalog Column - Right */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide font-['Outfit'] text-[#002830]">
                    Current Fishing Spots ({fishingSpots.length})
                  </h4>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {fishingSpots.map((spot, idx) => (
                      <div key={idx} className="rounded-xl border border-[#00B5AD]/20 bg-white p-0 shadow-sm relative group overflow-hidden">
                        {/* Spot Image Banner */}
                        {spot.image && (
                          <div className="h-32 w-full overflow-hidden border-b border-[#00B5AD]/10">
                            <img
                              src={spot.image}
                              alt={spot.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 flex-grow">
                              <h5 className="text-sm font-black text-[#002830] font-['Outfit']">{spot.name}</h5>
                              {spot.coordinates && (
                                <div className="flex items-center gap-1 text-[10px] text-[#6B7A82] font-mono">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  {spot.coordinates}
                                </div>
                              )}
                            </div>
                            {/* Actions overlay buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditSpot(spot, idx)}
                                className="p-1.5 rounded-full bg-[#00B5AD]/10 border border-[#00B5AD]/20 text-[#00B5AD] hover:bg-[#00B5AD] hover:text-white transition-all cursor-pointer"
                                title="Edit Spot"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSpot(idx)}
                                className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                title="Remove Fishing Spot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[10px] text-[#6B7A82] leading-relaxed line-clamp-2">{spot.description}</p>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {spot.difficulty && (
                              <span className="text-[9px] font-black text-[#00B5AD] uppercase border border-[#00B5AD]/20 bg-[#00B5AD]/5 px-2 py-0.5 rounded-full">
                                {spot.difficulty}
                              </span>
                            )}
                            {spot.terrain && (
                              <span className="text-[9px] font-black text-[#6B7A82] uppercase border border-[#6B7A82]/20 px-2 py-0.5 rounded-full">
                                {spot.terrain.split(',')[0]}
                              </span>
                            )}
                            {spot.bestTime && (
                              <span className="text-[9px] font-black text-[#6B7A82] uppercase border border-[#6B7A82]/20 px-2 py-0.5 rounded-full">
                                {spot.bestTime}
                              </span>
                            )}
                          </div>

                          {spot.lures && (
                            <div className="pt-1 border-t border-[#00B5AD]/10 text-[10px] font-bold text-[#6B7A82]">
                              Recommended Lures: <span className="text-[#002830]">{spot.lures}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: CMS CONTENT EDITOR */}
          {activeTab === 'cms' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                CMS Site Content Editor
              </h3>

              {/* Homepage texts CMS */}
              <form onSubmit={handleUpdateCMS} className="bg-[#0A424A]/5 border border-[#00B5AD]/20 p-6 rounded-2xl space-y-4 text-xs font-semibold text-[#002830]">
                <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830]">Homepage Copy Editor</h4>
                
                <div className="flex space-x-2 border-b border-[#00B5AD]/20 pb-2">
                  {[0, 1, 2, 3].map(index => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlideTab(index)}
                      className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-colors ${
                        currentSlideTab === index ? 'bg-[#00B5AD] text-white' : 'bg-transparent text-[#6B7A82] hover:bg-[#00B5AD]/10'
                      }`}
                    >
                      Slide {index + 1}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-1.5 pt-2">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Slide {currentSlideTab + 1} Title</label>
                  <input
                    type="text"
                    value={cmsForm.slides[currentSlideTab]?.title || ''}
                    onChange={(e) => {
                      const newSlides = [...cmsForm.slides];
                      newSlides[currentSlideTab] = { ...newSlides[currentSlideTab], title: e.target.value };
                      setCmsForm(prev => ({ ...prev, slides: newSlides }));
                    }}
                    className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Slide {currentSlideTab + 1} Subtitle Copy</label>
                  <input
                    type="text"
                    value={cmsForm.slides[currentSlideTab]?.subtitle || ''}
                    onChange={(e) => {
                      const newSlides = [...cmsForm.slides];
                      newSlides[currentSlideTab] = { ...newSlides[currentSlideTab], subtitle: e.target.value };
                      setCmsForm(prev => ({ ...prev, slides: newSlides }));
                    }}
                    className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Slide {currentSlideTab + 1} Description</label>
                  <textarea
                    value={cmsForm.slides[currentSlideTab]?.description || ''}
                    onChange={(e) => {
                      const newSlides = [...cmsForm.slides];
                      newSlides[currentSlideTab] = { ...newSlides[currentSlideTab], description: e.target.value };
                      setCmsForm(prev => ({ ...prev, slides: newSlides }));
                    }}
                    rows="2"
                    className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Slide {currentSlideTab + 1} Background Image {uploadingImage && '(Uploading...)'}</label>
                  {cmsForm.slides[currentSlideTab]?.image && (
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={cmsForm.slides[currentSlideTab]?.image}
                        alt={`Slide ${currentSlideTab + 1}`}
                        className="h-16 w-32 object-cover rounded-lg border border-[#00B5AD]/30 bg-black/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSlides = [...cmsForm.slides];
                          newSlides[currentSlideTab] = { ...newSlides[currentSlideTab], image: '' };
                          setCmsForm(prev => ({ ...prev, slides: newSlides }));
                        }}
                        className="text-xs text-red-500 font-extrabold hover:underline cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingImage(true);
                      setStatusMsg({ type: null, text: '' });
                      try {
                        const compressedBase64 = await compressImage(file, 1200, 0.75, true);
                        const newSlides = [...cmsForm.slides];
                        newSlides[currentSlideTab] = { ...newSlides[currentSlideTab], image: compressedBase64 };
                        setCmsForm(prev => ({ ...prev, slides: newSlides }));
                        setStatusMsg({ type: 'success', text: 'Slide background image set. Click Save to apply changes.' });
                      } catch (err) {
                        setStatusMsg({ type: 'error', text: err.message });
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                    className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#00B5AD]/10 file:text-[#00B5AD] hover:file:bg-[#00B5AD]/20"
                  />
                  <div className="mt-1">
                    <span className="text-[10px] text-[#6B7A82]/70 font-semibold block">Or paste raw Image URL / Base64 string:</span>
                    <input
                      type="text"
                      placeholder="e.g. https://example.com/hero.jpg"
                      value={cmsForm.slides[currentSlideTab]?.image || ''}
                      onChange={(e) => {
                        const newSlides = [...cmsForm.slides];
                        newSlides[currentSlideTab] = { ...newSlides[currentSlideTab], image: e.target.value };
                        setCmsForm(prev => ({ ...prev, slides: newSlides }));
                      }}
                      className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Why Choose Us Paragraph</label>
                  <textarea
                    value={cmsForm.whyChooseUs}
                    onChange={(e) => setCmsForm((prev) => ({ ...prev, whyChooseUs: e.target.value }))}
                    rows="4"
                    className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00B5AD] hover:bg-[#00A39E] disabled:bg-[#00B5AD]/50 text-[#FFFFFF] font-extrabold uppercase py-2.5 px-6 rounded-lg tracking-wider transition-all cursor-pointer"
                >
                  {loading ? 'Saving Changes...' : 'Save Homepage Copy'}
                </button>
              </form>

              {/* Guides Section CMS */}
              <form onSubmit={handleUpdateCMS} className="bg-[#0A424A]/5 border border-[#00B5AD]/20 p-6 rounded-2xl space-y-4 text-xs font-semibold text-[#002830]">
                <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830]">Champion Guides Section</h4>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Title</label>
                  <input type="text" value={cmsForm.guides.title} onChange={(e) => setCmsForm(prev => ({...prev, guides: {...prev.guides, title: e.target.value}}))} className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Paragraph</label>
                  <textarea value={cmsForm.guides.text} onChange={(e) => setCmsForm(prev => ({...prev, guides: {...prev.guides, text: e.target.value}}))} rows="3" className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Image Upload {uploadingImage && '(Uploading...)'}</label>
                  {cmsForm.guides.image && (
                    <div className="mb-2">
                      <img src={cmsForm.guides.image} alt="Guides" className="h-16 w-16 object-cover rounded-lg border border-[#00B5AD]/30" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'guides')} disabled={uploadingImage} className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#00B5AD]/10 file:text-[#00B5AD] hover:file:bg-[#00B5AD]/20" />
                </div>
                <button type="submit" disabled={loading} className="bg-[#00B5AD] hover:bg-[#00A39E] text-white font-extrabold uppercase py-2 px-4 rounded-lg tracking-wider cursor-pointer">Save Guides Section</button>
              </form>

              {/* Spots Section CMS */}
              <form onSubmit={handleUpdateCMS} className="bg-[#0A424A]/5 border border-[#00B5AD]/20 p-6 rounded-2xl space-y-4 text-xs font-semibold text-[#002830]">
                <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830]">Fishing Hotspots Section</h4>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Title</label>
                  <input type="text" value={cmsForm.spots.title} onChange={(e) => setCmsForm(prev => ({...prev, spots: {...prev.spots, title: e.target.value}}))} className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Paragraph</label>
                  <textarea value={cmsForm.spots.text} onChange={(e) => setCmsForm(prev => ({...prev, spots: {...prev.spots, text: e.target.value}}))} rows="3" className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Image Upload {uploadingImage && '(Uploading...)'}</label>
                  {cmsForm.spots.image && (
                    <div className="mb-2">
                      <img src={cmsForm.spots.image} alt="Spots" className="h-16 w-16 object-cover rounded-lg border border-[#00B5AD]/30" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'spots')} disabled={uploadingImage} className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#00B5AD]/10 file:text-[#00B5AD] hover:file:bg-[#00B5AD]/20" />
                </div>
                <button type="submit" disabled={loading} className="bg-[#00B5AD] hover:bg-[#00A39E] text-white font-extrabold uppercase py-2 px-4 rounded-lg tracking-wider cursor-pointer">Save Spots Section</button>
              </form>

              {/* Dining Section CMS */}
              <form onSubmit={handleUpdateCMS} className="bg-[#0A424A]/5 border border-[#00B5AD]/20 p-6 rounded-2xl space-y-4 text-xs font-semibold text-[#002830]">
                <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830]">Shore-to-Table Dining Section</h4>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Title</label>
                  <input type="text" value={cmsForm.dining.title} onChange={(e) => setCmsForm(prev => ({...prev, dining: {...prev.dining, title: e.target.value}}))} className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Paragraph</label>
                  <textarea value={cmsForm.dining.text} onChange={(e) => setCmsForm(prev => ({...prev, dining: {...prev.dining, text: e.target.value}}))} rows="3" className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[#6B7A82] uppercase text-[10px]">Image Upload {uploadingImage && '(Uploading...)'}</label>
                  {cmsForm.dining.image && (
                    <div className="mb-2">
                      <img src={cmsForm.dining.image} alt="Dining" className="h-16 w-16 object-cover rounded-lg border border-[#00B5AD]/30" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'dining')} disabled={uploadingImage} className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#00B5AD]/10 file:text-[#00B5AD] hover:file:bg-[#00B5AD]/20" />
                </div>
                <button type="submit" disabled={loading} className="bg-[#00B5AD] hover:bg-[#00A39E] text-white font-extrabold uppercase py-2 px-4 rounded-lg tracking-wider cursor-pointer">Save Dining Section</button>
              </form>

            </div>
          )}

          {/* VIEW 8: RESTAURANTS PARTNER CMS */}
          {activeTab === 'restaurantsTab' && (
            <div className="space-y-8 text-[#002830]">
              <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
                Dining Partners Directory Manager
              </h3>

              {/* Partners Restaurants CMS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#00B5AD]/10 pt-8 text-[#002830]">
                
                {/* Add Partner Form */}
                <form onSubmit={handleAddRestaurant} className="bg-[#0A424A]/5 border border-[#00B5AD]/20 p-6 rounded-2xl space-y-4 text-xs font-semibold text-[#002830]">
                  <h4 className="text-sm font-bold uppercase tracking-wider font-['Outfit'] text-[#002830]">Add Gourmet Dining Partner</h4>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Restaurant Name</label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Marina Restaurant"
                      className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[#6B7A82] uppercase text-[10px]">Address / Map Link</label>
                    <input
                      type="text"
                      required
                      value={restaurantForm.mapLink}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, mapLink: e.target.value }))}
                      placeholder="Red Hook Road"
                      className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[#6B7A82] uppercase text-[10px]">Distance</label>
                      <input
                        type="text"
                        required
                        value={restaurantForm.distance}
                        onChange={(e) => setRestaurantForm((prev) => ({ ...prev, distance: e.target.value }))}
                        placeholder="0.5 miles"
                        className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[#6B7A82] uppercase text-[10px]">Fee Estimate</label>
                      <input
                        type="text"
                        required
                        value={restaurantForm.feeEstimate}
                        onChange={(e) => setRestaurantForm((prev) => ({ ...prev, feeEstimate: e.target.value }))}
                        placeholder="$15.00 per fish"
                        className="w-full bg-white border border-[#00B5AD]/30 text-[#002830] rounded-lg px-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00B5AD] hover:bg-[#00A39E] text-[#FFFFFF] font-extrabold uppercase py-2.5 rounded-lg tracking-wider cursor-pointer"
                  >
                    Register Partner
                  </button>
                </form>

                {/* List and delete partners */}
                <div className="space-y-4 text-[#002830]">
                  <h4 className="text-xs font-black uppercase text-[#002830] tracking-wider">Dining Partners Directory</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {restaurants.map((rest) => (
                      <div
                        key={rest.id}
                        className="rounded-xl border border-[#00B5AD]/20 bg-[#0A424A]/5 p-4 flex justify-between items-center text-xs font-semibold text-[#002830]"
                      >
                        <div>
                          <h5 className="font-extrabold text-[#002830]">{rest.name}</h5>
                          <span className="block text-[9px] text-[#6B7A82]">{rest.map_link} • {rest.distance}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteRestaurant(rest.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* VIEW: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-8 max-w-lg">
            <h3 className="text-xl font-bold uppercase tracking-wider font-['Outfit'] border-b border-[#00B5AD]/20 pb-2.5 text-[#002830]">
              My Admin Profile
            </h3>

            {/* Feedback Message */}
            {profileMsg.text && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                profileMsg.type === 'success'
                  ? 'bg-[#00B5AD]/10 border border-[#00B5AD]/30 text-[#00B5AD]'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-5">

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-black text-[#6B7A82] uppercase tracking-widest">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                  required
                  className="w-full border border-[#00B5AD]/30 rounded-xl px-4 py-3 text-sm text-[#002830] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/40"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-black text-[#6B7A82] uppercase tracking-widest">
                  <Save className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full border border-[#00B5AD]/30 rounded-xl px-4 py-3 text-sm text-[#002830] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/40"
                />
              </div>

              <div className="border-t border-[#00B5AD]/20 pt-4">
                <p className="text-xs text-[#6B7A82] mb-4">Leave blank to keep current password.</p>

                {/* Current Password */}
                <div className="space-y-1.5 mb-4">
                  <label className="flex items-center gap-2 text-xs font-black text-[#6B7A82] uppercase tracking-widest">
                    <Lock className="w-3.5 h-3.5" /> Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? 'text' : 'password'}
                      value={profileForm.currentPassword}
                      onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Required if changing password"
                      className="w-full border border-[#00B5AD]/30 rounded-xl px-4 py-3 pr-10 text-sm text-[#002830] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/40"
                    />
                    <button type="button" onClick={() => setShowCurrentPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A82] hover:text-[#002830]">
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5 mb-4">
                  <label className="flex items-center gap-2 text-xs font-black text-[#6B7A82] uppercase tracking-widest">
                    <Lock className="w-3.5 h-3.5" /> New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      value={profileForm.newPassword}
                      onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full border border-[#00B5AD]/30 rounded-xl px-4 py-3 pr-10 text-sm text-[#002830] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/40"
                    />
                    <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A82] hover:text-[#002830]">
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-black text-[#6B7A82] uppercase tracking-widest">
                    <Lock className="w-3.5 h-3.5" /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={e => setProfileForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    className="w-full border border-[#00B5AD]/30 rounded-xl px-4 py-3 text-sm text-[#002830] bg-white focus:outline-none focus:ring-2 focus:ring-[#00B5AD]/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00C4BB] text-white text-sm font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(0,181,173,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profileLoading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Global Control Center Footer */}
        <div className="mt-8 pt-4 border-t border-[#00B5AD]/20 text-center text-[10px] font-semibold text-[#6B7A82]">
          Secure Administrator Dashboard session • Logged in as: {session.fullName} ({session.email})
        </div>

      </div>

      {/* DETAIL MODAL: VIEW BOOKING FULL SPECS */}
      {selectedBooking && (
        <div className="fixed inset-0 pointer-events-auto z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="max-w-md w-full bg-[#04282F] border border-[#00B5AD]/25 rounded-2xl p-6 shadow-2xl relative space-y-4 text-xs font-semibold text-[#A0ACB3]">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-[#6B7A82] hover:text-[#FFFFFF] text-sm font-black p-1"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[9px] text-[#6B7A82] uppercase tracking-wider">Rental details modal</span>
              <h4 className="text-base font-extrabold text-[#FFFFFF] font-['Outfit']">
                Booking Reference #{selectedBooking.id.slice(0, 8).toUpperCase()}
              </h4>
            </div>

            <div className="divide-y divide-[#00B5AD]/10 text-[11px]">
              <div className="py-2.5 flex justify-between">
                <span>Client Name:</span>
                <span className="text-[#FFFFFF] font-bold">{selectedBooking.full_name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Contact Details:</span>
                <span className="text-[#FFFFFF]">{selectedBooking.email} • {selectedBooking.phone || 'No phone'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Package Type:</span>
                <span className="text-[#FFFFFF]">
                  {selectedBooking.guide_booked ? 'Guided Charters' : 'Shore Rental Package'}
                </span>
              </div>
              
              {!selectedBooking.guide_booked ? (
                <>
                  {selectedBooking.rental_date && (
                    <div className="py-2.5 flex justify-between">
                      <span>Adult Rental Period:</span>
                      <span className="text-[#FFFFFF]">
                        {new Date(selectedBooking.rental_date).toLocaleDateString()} to {
                          (() => {
                            const d = new Date(selectedBooking.rental_date);
                            d.setDate(d.getDate() + (selectedBooking.rental_duration || 3) - 1);
                            return d.toLocaleDateString();
                          })()
                        } ({selectedBooking.rental_duration} Days)
                      </span>
                    </div>
                  )}
                  <div className="py-2.5 flex justify-between">
                    <span>Adult Poles:</span>
                    <span className="text-[#FFFFFF]">{selectedBooking.pole_quantity || 0} Poles Bundle</span>
                  </div>

                  {selectedBooking.child_pole_quantity > 0 && (
                    <>
                      {selectedBooking.child_pole_date && (
                        <div className="py-2.5 flex justify-between border-t border-[#00B5AD]/5">
                          <span>Children Rental Period:</span>
                          <span className="text-[#FFFFFF]">
                            {new Date(selectedBooking.child_pole_date).toLocaleDateString()} to {
                              (() => {
                                const d = new Date(selectedBooking.child_pole_date);
                                d.setDate(d.getDate() + 4);
                                return d.toLocaleDateString();
                              })()
                            } (5 Day Limit)
                          </span>
                        </div>
                      )}
                      <div className="py-2.5 flex justify-between">
                        <span>Children Poles:</span>
                        <span className="text-[#FFFFFF]">{selectedBooking.child_pole_quantity} Poles Bundle</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="py-2.5 flex justify-between">
                    <span>Excursion Date:</span>
                    <span className="text-[#FFFFFF]">{new Date(selectedBooking.guide_date).toLocaleDateString()}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span>Hours Selected:</span>
                    <span className="text-[#FFFFFF]">{selectedBooking.guide_hours} Hours</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span>Pickup Address:</span>
                    <span className="text-[#00B5AD] break-all">{selectedBooking.guide_pickup_location}</span>
                  </div>
                </>
              )}

              {/* Lures summary inside modal */}
              {selectedBooking.lures && selectedBooking.lures.length > 0 && (
                <div className="py-3.5 space-y-1">
                  <span className="block text-[9px] text-[#6B7A82] uppercase tracking-wider">Lures Cart List</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedBooking.lures.map((l, idx) => (
                      <span
                        key={idx}
                        className="bg-[#001418] border border-[#00B5AD]/25 text-[#A0ACB3] text-[9px] font-extrabold px-2.5 py-1 rounded-md"
                      >
                        {l.lure_name} (x{l.quantity})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#00B5AD]/10 pt-4 flex justify-between items-baseline">
              <span className="text-[10px] font-black uppercase text-[#6B7A82]">Receipt Fee Paid</span>
              <span className="text-[#00B5AD] text-xl font-black font-['Outfit']">${selectedBooking.total_price}</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
