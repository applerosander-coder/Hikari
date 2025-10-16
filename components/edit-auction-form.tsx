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
import { Upload, ArrowLeft, Trash2, Plus, GripVertical, Loader2, Sparkles, MapPin } from 'lucide-react';
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

interface Auction {
  id: string;
  name?: string | null;
  place?: string | null;
  title: string;
  description: string | null;
  starting_price: number;
  reserve_price: number | null;
  category: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  status: string;
}

interface AuctionItemDB {
  id: string;
  auction_id: string;
  title: string;
  description: string | null;
  starting_price: number;
  reserve_price: number | null;
  category?: string | null;
  image_url: string | null;
  position: number;
}

interface AuctionItem {
  id: string;
  dbId?: string;
  title: string;
  description: string;
  starting_price: string;
  reserve_price: string;
  category: string;
  image_preview: string | null;
  image_file: File | null;
  position: number;
  ai_used_for_current_image: boolean;
}

interface EditAuctionFormProps {
  auction: Auction;
  auctionItems: AuctionItemDB[];
  userId: string;
}

export function EditAuctionForm({ auction, auctionItems, userId }: EditAuctionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [useNowForStartDate, setUseNowForStartDate] = useState(false);
  const [use24hForEndDate, setUse24hForEndDate] = useState(false);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [auctionData, setAuctionData] = useState({
    name: auction.name || auction.title,
    place: auction.place || '',
    start_date: formatDateForInput(auction.start_date),
    end_date: formatDateForInput(auction.end_date),
  });

  const [items, setItems] = useState<AuctionItem[]>(() => {
    if (auctionItems.length > 0) {
      return auctionItems.map(item => ({
        id: item.id,
        dbId: item.id,
        title: item.title,
        description: item.description || '',
        starting_price: (item.starting_price / 100).toFixed(2),
        reserve_price: item.reserve_price ? (item.reserve_price / 100).toFixed(2) : '',
        category: item.category || '',
        image_preview: item.image_url,
        image_file: null,
        position: item.position,
        ai_used_for_current_image: false,
      }));
    } else {
      return [{
        id: Date.now().toString(),
        title: auction.title,
        description: auction.description || '',
        starting_price: (auction.starting_price / 100).toFixed(2),
        reserve_price: auction.reserve_price ? (auction.reserve_price / 100).toFixed(2) : '',
        category: auction.category || '',
        image_preview: auction.image_url,
        image_file: null,
        position: 1,
        ai_used_for_current_image: false,
      }];
    }
  });

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
      position: items.length + 1,
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
    
    const maxSize = 10 * 1024 * 1024;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    if (file.size > maxSize) {
      toast.error(`Image is too large (${fileSizeMB}MB). Maximum size is 10MB.`);
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    
    reader.onerror = () => {
      toast.error('Failed to read image file. Please try again.');
      e.target.value = '';
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
    const timeoutId = setTimeout(() => {
      setIsGettingLocation(false);
      toast.error('Location request timed out. Please enable location access or enter manually.');
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          const locationString = [city, state].filter(Boolean).join(', ');
          
          if (locationString) {
            setAuctionData({ ...auctionData, place: locationString });
            toast.success('Location detected!');
          } else {
            toast.error('Could not determine location. Please enter manually.');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('Failed to get location. Please enter manually.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        setIsGettingLocation(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location access denied. Please enable location permissions or enter manually.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error('Location unavailable. Please enter manually.');
        } else {
          toast.error('Location request failed. Please enter manually.');
        }
      }
    );
  };

  const handleGenerateDescription = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (!item.image_preview) {
      toast.error('Please upload an image first to generate auction details');
      return;
    }

    setGeneratingAI(itemId);

    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: item.image_preview,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate auction details');
      }
      
      const data = await response.json();
      console.log('Received data from API:', data);
      
      if (!data.title || !data.description || !data.category) {
        throw new Error('Incomplete response from AI');
      }
      
      setItems(prevItems => prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              title: data.title,
              description: data.description, 
              category: data.category,
              ai_used_for_current_image: true 
            } 
          : item
      ));
      
      toast.success('Auction details generated successfully!');
    } catch (error: any) {
      console.error('Error generating auction details:', error);
      toast.error(error.message || 'Failed to generate auction details');
    } finally {
      setGeneratingAI(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this draft auction? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/auctions/${auction.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete auction');
      }

      toast.success('Auction deleted successfully');
      router.push('/seller');
      router.refresh();
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error('Failed to delete auction');
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!auctionData.name || !auctionData.end_date) {
        toast.error('Please fill in auction name and end date');
        setIsSubmitting(false);
        return;
      }

      const validItems = items.filter(item => item.title && item.starting_price && item.category);
      if (validItems.length === 0) {
        toast.error('Please add at least one item with title, starting price, and category');
        setIsSubmitting(false);
        return;
      }

      if (items.some(item => item.title && item.starting_price && !item.category)) {
        toast.error('Please select a category for all items');
        setIsSubmitting(false);
        return;
      }

      const uploadPromises = validItems.map(async (item) => {
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
        return item.image_preview;
      });

      let uploadedUrls: (string | null)[] = [];
      try {
        uploadedUrls = await Promise.all(uploadPromises);
      } catch (uploadError: any) {
        toast.error(uploadError.message || 'Image upload failed');
        setIsSubmitting(false);
        return;
      }

      const startDateISO = auctionData.start_date 
        ? new Date(auctionData.start_date).toISOString() 
        : new Date().toISOString();
      const endDateISO = new Date(auctionData.end_date).toISOString();

      const itemsData = validItems.map((item, index) => ({
        id: item.dbId,
        title: item.title,
        description: item.description || null,
        starting_price: Math.round(parseFloat(item.starting_price) * 100),
        reserve_price: item.reserve_price 
          ? Math.round(parseFloat(item.reserve_price) * 100) 
          : null,
        category: item.category || null,
        image_url: uploadedUrls[index] || null,
        position: index + 1,
      }));

      const payload = {
        auction: {
          name: auctionData.name,
          place: auctionData.place || null,
          start_date: startDateISO,
          end_date: endDateISO,
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

      const response = await fetch(`/api/auctions/${auction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to update auction';
        throw new Error(errorMessage);
      }

      toast.success('Auction updated successfully!');
      router.push('/seller');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating auction:', error);
      const errorMessage = error.message || 'Failed to update auction. Please try again.';
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/seller')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/seller/preview/${auction.id}`)}
          className="flex items-center gap-2"
        >
          Preview
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 ml-auto"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete Draft
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Auction Details</h3>
            <p className="text-sm text-muted-foreground">
              Update your auction container details
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div>
              <Label htmlFor="place">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="place"
                  value={auctionData.place}
                  onChange={(e) => setAuctionData({ ...auctionData, place: e.target.value })}
                  placeholder="e.g., Los Angeles, CA or Online"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  title="Detect my location"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={auctionData.start_date}
                  onChange={(e) => {
                    setAuctionData({ ...auctionData, start_date: e.target.value });
                    setUseNowForStartDate(false);
                  }}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="use-now"
                    checked={useNowForStartDate}
                    onCheckedChange={(checked) => {
                      setUseNowForStartDate(checked as boolean);
                      if (checked) {
                        const now = new Date();
                        const formatted = formatDateForInput(now.toISOString());
                        setAuctionData({ ...auctionData, start_date: formatted });
                      }
                    }}
                  />
                  <Label htmlFor="use-now" className="text-sm font-normal cursor-pointer">
                    Now
                  </Label>
                </div>
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
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
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="use-24h"
                    checked={use24hForEndDate}
                    onCheckedChange={(checked) => {
                      setUse24hForEndDate(checked as boolean);
                      if (checked) {
                        const startDate = auctionData.start_date 
                          ? new Date(auctionData.start_date) 
                          : new Date();
                        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                        const formatted = formatDateForInput(endDate.toISOString());
                        setAuctionData({ ...auctionData, end_date: formatted });
                      }
                    }}
                  />
                  <Label htmlFor="use-24h" className="text-sm font-normal cursor-pointer">
                    24h
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                {/* Image Upload - Now First */}
                <div>
                  <Label htmlFor={`image-${item.id}`}>Item Image</Label>
                  <div className="mt-2">
                    {item.image_preview ? (
                      <div className="relative w-full h-48 border rounded-lg overflow-hidden">
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
                                ? { ...i, image_preview: null, image_file: null, ai_used_for_current_image: false } 
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
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">
                          Click to upload item photo (Max 10MB)
                        </span>
                      </label>
                    )}
                    <input
                      id={`image-${item.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(item.id, e)}
                    />
                  </div>
                </div>

                {/* AI Generate Button - Only show for newly uploaded photos (base64) */}
                {item.image_preview && item.image_preview.startsWith('data:image/') && !item.ai_used_for_current_image && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateDescription(item.id)}
                    disabled={generatingAI === item.id}
                    className="w-full h-9 relative overflow-hidden transition-all duration-1000 hover:shadow-[inset_0_0_60px_rgba(192,192,192,0.9),0_0_50px_rgba(192,192,192,0.8),0_0_70px_rgba(255,255,255,0.6)] hover:border-gray-400/70 hover:bg-gray-400/5 disabled:hover:shadow-none disabled:hover:border-border disabled:hover:bg-transparent backdrop-blur-sm animate-[glow_30s_linear_infinite]"
                  >
                    {generatingAI === item.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing photo & generating details...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 text-gray-400 transition-all duration-500" />
                        Generate title, description & category from photo
                      </>
                    )}
                  </Button>
                )}

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

                {/* Description */}
                <div>
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Textarea
                    id={`description-${item.id}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    placeholder="Describe this item..."
                    rows={3}
                  />
                </div>

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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Auction...
            </>
          ) : (
            `Update Auction with ${items.length} Item${items.length > 1 ? 's' : ''}`
          )}
        </Button>
      </form>
    </div>
  );
}
