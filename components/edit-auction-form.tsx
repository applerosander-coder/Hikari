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
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
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

interface Auction {
  id: string;
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

interface EditAuctionFormProps {
  auction: Auction;
  userId: string;
}

export function EditAuctionForm({ auction, userId }: EditAuctionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(auction.image_url);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Format dates for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: auction.title,
    description: auction.description || '',
    starting_price: (auction.starting_price / 100).toFixed(2),
    reserve_price: auction.reserve_price ? (auction.reserve_price / 100).toFixed(2) : '',
    category: auction.category || '',
    start_date: formatDateForInput(auction.start_date),
    end_date: formatDateForInput(auction.end_date),
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
        image_url: imagePreview || null,
      };

      // Submit to API
      const response = await fetch(`/api/auctions/${auction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auctionData),
      });

      if (!response.ok) {
        throw new Error('Failed to update auction');
      }

      toast.success('Auction updated successfully!');
      router.push('/seller');
      router.refresh();
    } catch (error) {
      console.error('Error updating auction:', error);
      toast.error('Failed to update auction');
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
              <Loader2 className="h-4 w-4 animate-spin" />
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

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Auction Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Vintage Watch Collection"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your item in detail..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starting_price">
                  Starting Price (USD) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="starting_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reserve_price">Reserve Price (USD)</Label>
                <Input
                  id="reserve_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.reserve_price}
                  onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value })}
                  placeholder="Optional minimum"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Auction Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative h-48 w-full">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image
                    </span>
                    <span className="text-xs text-muted-foreground">Max 5MB</span>
                  </label>
                )}
              </div>
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
                'Update Auction'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
