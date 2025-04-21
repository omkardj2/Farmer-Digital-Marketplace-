import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AddPriceFormProps {
  onSubmit: (data: { cropName: string; location: string; price: number }) => void;
}

const crops = [
  "Wheat",
  "Rice",
  "Corn",
  "Soybean",
  "Cotton",
  "Sugarcane",
  "Potato",
  "Tomato",
  "Onion",
];

export default function AddPriceForm({ onSubmit }: AddPriceFormProps) {
  const [formData, setFormData] = useState({
    cropName: "",
    location: "",
    price: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cropName && formData.location && formData.price) {
      onSubmit({
        cropName: formData.cropName,
        location: formData.location,
        price: parseFloat(formData.price),
      });
      // Reset form
      setFormData({ cropName: "", location: "", price: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cropName">Crop Name</Label>
        <Select
          value={formData.cropName}
          onValueChange={(value) =>
            setFormData({ ...formData, cropName: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a crop" />
          </SelectTrigger>
          <SelectContent>
            {crops.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          placeholder="Enter location"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (₹/quintal)</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
          placeholder="Enter price"
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <Input
          id="unit"
          value="quintal"
          disabled
          className="bg-gray-100"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600"
        disabled={!formData.cropName || !formData.location || !formData.price}
      >
        Add New Entry
      </Button>
    </form>
  );
}
