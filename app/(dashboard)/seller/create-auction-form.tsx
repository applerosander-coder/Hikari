'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Plus, Trash2, GripVertical, Loader2, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { uploadImage } from '@/utils/supabase/storage/client';

const CATEGORIES = [
  'Electronics',
  'Fashion & Accessories',
  'Services & Experiences',
  'Collectibles & Art',
  'Home & Living',
  'Sports & Hobbies',
  'Other'
];

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: string;
  reserve_price: string;
  category: string;
  image_preview: string | null;
  image_file: File | null;
  ai_used_for_current_image: boolean;
}

interface CreateAuctionFormProps {
  userId: string;
}

export default function CreateAuctionForm({ userId }: CreateAuctionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null); // Track which item is generating
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [useNowForStartDate, setUseNowForStartDate] = useState(false);
  const [use24hForEndDate, setUse24hForEndDate] = useState(false);

  // Auction container fields
  const [auctionData, setAuctionData] = useState({
    name: '',
    place: '',
    start_date: '',
    end_date: '',
  });

  // Items list
  const [items, setItems] = useState<AuctionItem[]>([
    {
      id: '1',
      title: '',
      description: '',
      starting_price: '',
      reserve_price: '',
      category: '',
      image_preview: null,
      image_file: null,
      ai_used_for_current_image: false,
    }
  ]);

  const handleAddItem = () => {
    const newItem: AuctionItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      starting_price: '',
      reserve_price: '',
      category: '',
      image_preview: null,
      image_file: null,
      ai_used_for_current_image: false,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length === 1) {
      toast.error('You must have at least one item');
      return;
    }
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof AuctionItem, value: any) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleImageChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    if (file.size > maxSize) {
      toast.error(`Image is too large (${fileSizeMB}MB). Maximum size is 10MB.`);
      e.target.value = ''; // Clear the file input
      return;
    }
    
    const reader = new FileReader();
    
    reader.onerror = () => {
      toast.error('Failed to read image file. Please try again.');
      e.target.value = ''; // Clear the file input
    };
    
    reader.onload = () => {
      const result = reader.result as string;
      
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { ...item, image_preview: result, image_file: file, ai_used_for_current_image: false } 
          : item
      ));
    };
    
    reader.readAsDataURL(file);
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    // Create a timeout to stop trying after 10 seconds
    const timeoutId = setTimeout(() => {
      setIsGettingLocation(false);
      toast.error('Location request timed out. Please enter location manually or allow location access in your browser settings.');
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        try {
          // Use reverse geocoding API to get location name
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get location');
          }

          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';
          const country = data.address.country || '';
          
          const locationString = [city, state].filter(Boolean).join(', ') || country;
          
          setAuctionData({ ...auctionData, place: locationString });
          toast.success('Location detected!');
        } catch (error) {
          console.error('Error getting location:', error);
          toast.error('Failed to get location name');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Geolocation error:', error);
        
        // Provide specific error messages based on error code
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied. Please enable location permissions in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location information unavailable. Please enter manually.');
        } else if (error.code === error.TIMEOUT) {
          toast.error('Location request timed out. Please try again or enter manually.');
        } else {
          toast.error('Failed to get location. Please enter manually.');
        }
        
        setIsGettingLocation(false);
      },
      {
        timeout: 10000, // 10 second timeout
        enableHighAccuracy: false, // Faster response on mobile
      }
    );
  };

  const handleGenerateDescription = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Require at least one of image or title
    if (!item.image_preview && !item.title.trim()) {
      toast.error('Please upload an image or enter a title first');
      return;
    }
    
    setGeneratingAI(itemId);
    
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: item.image_preview || undefined,
          itemTitle: item.title.trim() || undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate description');
      }
      
      const data = await response.json();
      console.log('Received data from API:', data);
      
      if (!data.description) {
        throw new Error('No description in response');
      }
      
      // Update the item's description, category, and mark AI as used
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              description: data.description, 
              category: data.category || item.category,
              ai_used_for_current_image: true 
            } 
          : item
      ));
      
      toast.success('Description generated successfully!');
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast.error(error.message || 'Failed to generate description');
    } finally {
      setGeneratingAI(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate auction container fields
      if (!auctionData.name || !auctionData.end_date) {
        toast.error('Please fill in auction name and end date');
        setIsSubmitting(false);
        return;
      }

      // Validate at least one item with required fields
      const validItems = items.filter(item => item.title && item.starting_price && item.category);
      if (validItems.length === 0) {
        toast.error('Please add at least one item with title, starting price, and category');
        setIsSubmitting(false);
        return;
      }

      // Check if any items are missing category
      const missingCategory = items.some(item => item.title && !item.category);
      if (missingCategory) {
        toast.error('Please select a category for all items');
        setIsSubmitting(false);
        return;
      }

      // Upload images to Supabase Storage
      const uploadPromises = validItems.map(async (item, index) => {
        if (item.image_file) {
          const { imageUrl, error } = await uploadImage({
            file: item.image_file,
            bucket: 'seller-auctions',
            folder: userId,
          });
          
          if (error) {
            throw new Error(`Failed to upload image for item "${item.title}": ${error}`);
          }
          
          return imageUrl;
        }
        return null;
      });

      let uploadedUrls: (string | null)[] = [];
      try {
        uploadedUrls = await Promise.all(uploadPromises);
      } catch (uploadError: any) {
        toast.error(uploadError.message || 'Image upload failed');
        setIsSubmitting(false);
        return;
      }

      // Convert datetime-local strings to ISO format (preserves user's local time)
      const startDateISO = auctionData.start_date 
        ? new Date(auctionData.start_date).toISOString() 
        : new Date().toISOString();
      const endDateISO = new Date(auctionData.end_date).toISOString();

      // Prepare items data with uploaded image URLs
      const itemsData = validItems.map((item, index) => ({
        title: item.title,
        description: item.description || null,
        starting_price: Math.round(parseFloat(item.starting_price) * 100), // Convert to cents
        reserve_price: item.reserve_price 
          ? Math.round(parseFloat(item.reserve_price) * 100) 
          : null,
        category: item.category || null,
        image_url: uploadedUrls[index] || null,
        position: index + 1,
      }));

      // Prepare complete auction data with items
      const payload = {
        auction: {
          name: auctionData.name,
          place: auctionData.place || null,
          start_date: startDateISO,
          end_date: endDateISO,
          created_by: userId,
          status: 'draft' as const,
          // Legacy fields for backward compatibility (use first item's data)
          title: validItems[0].title,
          description: validItems[0].description || null,
          starting_price: Math.round(parseFloat(validItems[0].starting_price) * 100),
          reserve_price: validItems[0].reserve_price 
            ? Math.round(parseFloat(validItems[0].reserve_price) * 100) 
            : null,
          category: validItems[0].category || null,
          image_url: uploadedUrls[0] || null,
        },
        items: itemsData,
      };

      // Submit to API
      const response = await fetch('/api/auctions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create auction');
      }

      const { data } = await response.json();
      
      toast.success(`Auction created with ${itemsData.length} item${itemsData.length > 1 ? 's' : ''}!`);
      
      // Reset form
      setAuctionData({
        name: '',
        place: '',
        start_date: '',
        end_date: '',
      });
      setItems([{
        id: '1',
        title: '',
        description: '',
        starting_price: '',
        reserve_price: '',
        category: '',
        image_preview: null,
        image_file: null,
      }]);

      // Refresh the page to show new auction
      router.refresh();
    } catch (error: any) {
      console.error('Error creating auction:', error);
      toast.error(error.message || 'Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Auction Container Details */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Auction Details</h3>
          <p className="text-sm text-muted-foreground">
            Create a container for multiple items
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Auction Name *</Label>
            <Input
              id="name"
              value={auctionData.name}
              onChange={(e) => setAuctionData({ ...auctionData, name: e.target.value })}
              placeholder="e.g., Estate Sale, Art Gallery Auction"
              required
            />
          </div>

          {/* Place */}
          <div>
            <Label htmlFor="place">Location</Label>
            <div className="flex gap-2">
              <Input
                id="place"
                value={auctionData.place}
                onChange={(e) => setAuctionData({ ...auctionData, place: e.target.value })}
                placeholder="e.g., Los Angeles, CA or Online"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                title="Use my location"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="start_date">Start Date</Label>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="now-checkbox"
                    checked={useNowForStartDate}
                    onCheckedChange={(checked) => {
                      setUseNowForStartDate(checked as boolean);
                      if (checked) {
                        const now = new Date();
                        const offset = now.getTimezoneOffset() * 60000;
                        const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
                        setAuctionData({ ...auctionData, start_date: localISOTime });
                      }
                    }}
                  />
                  <Label htmlFor="now-checkbox" className="text-sm font-normal cursor-pointer">
                    Now
                  </Label>
                </div>
              </div>
              <Input
                id="start_date"
                type="datetime-local"
                value={auctionData.start_date}
                onChange={(e) => {
                  setAuctionData({ ...auctionData, start_date: e.target.value });
                  setUseNowForStartDate(false);
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="end_date">End Date *</Label>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="24h-checkbox"
                    checked={use24hForEndDate}
                    onCheckedChange={(checked) => {
                      setUse24hForEndDate(checked as boolean);
                      if (checked) {
                        // Use start date if available, otherwise use current time
                        const baseTime = auctionData.start_date 
                          ? new Date(auctionData.start_date)
                          : new Date();
                        
                        // Add 24 hours (24 * 60 * 60 * 1000 milliseconds)
                        const endTime = new Date(baseTime.getTime() + 24 * 60 * 60 * 1000);
                        
                        // Convert to local datetime-local format
                        const offset = endTime.getTimezoneOffset() * 60000;
                        const localISOTime = new Date(endTime.getTime() - offset).toISOString().slice(0, 16);
                        
                        setAuctionData({ ...auctionData, end_date: localISOTime });
                      }
                    }}
                  />
                  <Label htmlFor="24h-checkbox" className="text-sm font-normal cursor-pointer">
                    24h
                  </Label>
                </div>
              </div>
              <Input
                id="end_date"
                type="datetime-local"
                value={auctionData.end_date}
                onChange={(e) => {
                  setAuctionData({ ...auctionData, end_date: e.target.value });
                  setUse24hForEndDate(false);
                }}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Auction Items ({items.length})</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Item {index + 1}</span>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor={`title-${item.id}`}>Item Title *</Label>
                <Input
                  id={`title-${item.id}`}
                  value={item.title}
                  onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                  placeholder="Enter item title"
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor={`image-${item.id}`}>Item Image</Label>
                <div className="mt-2">
                  {item.image_preview ? (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <Image
                        src={item.image_preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setItems(prevItems => prevItems.map(i => 
                            i.id === item.id 
                              ? { ...i, image_preview: null, image_file: null } 
                              : i
                          ));
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`image-${item.id}`}
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Click to upload (Max 10MB)
                      </span>
                      <input
                        id={`image-${item.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(item.id, e)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateDescription(item.id)}
                    disabled={generatingAI === item.id || (!item.image_preview && !item.title.trim()) || item.ai_used_for_current_image}
                    className={`h-7 text-xs relative overflow-hidden transition-all duration-1000 hover:shadow-[inset_0_0_60px_rgba(192,192,192,0.9),0_0_50px_rgba(192,192,192,0.8),0_0_70px_rgba(255,255,255,0.6)] hover:border-gray-400/70 hover:bg-gray-400/5 disabled:hover:shadow-none disabled:hover:border-border disabled:hover:bg-transparent backdrop-blur-sm ${item.image_preview && generatingAI !== item.id && !item.ai_used_for_current_image ? 'animate-[glow_30s_linear_infinite]' : ''}`}
                  >
                    {generatingAI === item.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1 text-gray-400 transition-all duration-500" />
                        Type for me
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id={`description-${item.id}`}
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  placeholder="Describe this item..."
                  rows={2}
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor={`category-${item.id}`}>Category *</Label>
                <Select
                  value={item.category}
                  onValueChange={(value) => handleItemChange(item.id, 'category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`starting_price-${item.id}`}>Starting Price ($) *</Label>
                  <Input
                    id={`starting_price-${item.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.starting_price}
                    onChange={(e) => handleItemChange(item.id, 'starting_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor={`reserve_price-${item.id}`}>Reserve Price ($)</Label>
                  <Input
                    id={`reserve_price-${item.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.reserve_price}
                    onChange={(e) => handleItemChange(item.id, 'reserve_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Auction...
          </>
        ) : (
          `Create Auction with ${items.length} Item${items.length > 1 ? 's' : ''}`
        )}
      </Button>
    </form>
  );
}
