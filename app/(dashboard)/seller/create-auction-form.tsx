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
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const CATEGORIES = [
  'Electronics',
  'Fashion & Accessories',
  'Services & Experiences',
  'Collectibles & Art',
  'Home & Living',
  'Sports & Hobbies',
  'Other'
];

interface CreateAuctionFormProps {
  userId: string;
}

export default function CreateAuctionForm({ userId }: CreateAuctionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_price: '',
    reserve_price: '',
    category: '',
    start_date: '',
    end_date: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.starting_price || !formData.end_date) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Convert prices from dollars to cents
      const startingPriceCents = Math.round(parseFloat(formData.starting_price) * 100);
      const reservePriceCents = formData.reserve_price 
        ? Math.round(parseFloat(formData.reserve_price) * 100) 
        : null;

      // Convert datetime-local strings to ISO format (preserves user's local time)
      const startDateISO = formData.start_date 
        ? new Date(formData.start_date).toISOString() 
        : new Date().toISOString();
      const endDateISO = new Date(formData.end_date).toISOString();

      // Prepare auction data
      const auctionData = {
        title: formData.title,
        description: formData.description || null,
        starting_price: startingPriceCents,
        reserve_price: reservePriceCents,
        category: formData.category || null,
        start_date: startDateISO,
        end_date: endDateISO,
        created_by: userId,
        status: 'draft' as const,
        image_url: imagePreview || null, // For now, store base64. In production, upload to storage
      };

      // Submit to API
      const response = await fetch('/api/auctions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auctionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create auction');
      }

      const { data } = await response.json();
      
      toast.success('Auction created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        starting_price: '',
        reserve_price: '',
        category: '',
        start_date: '',
        end_date: '',
      });
      setImagePreview(null);
      setImageFile(null);

      // Refresh the page to show new auction
      router.refresh();
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Auction Details</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter auction title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starting_price">Starting Price ($) *</Label>
              <Input
                id="starting_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.starting_price}
                onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="reserve_price">Reserve Price ($)</Label>
              <Input
                id="reserve_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.reserve_price}
                onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Auction Image</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload image
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Max 5MB
                  </span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Auction'
        )}
      </Button>
    </form>
  );
}
