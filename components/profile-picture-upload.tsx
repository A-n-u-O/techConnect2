// components/profile-picture-upload.tsx
"use client";

import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfilePictureUploadProps } from "./interfaces";



export default function ProfilePictureUpload({ 
  onImageChange, 
  currentImageUrl,
  className,
}: ProfilePictureUploadProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          // Set initial crop to be circular (1:1 aspect ratio)
          setCrop({
            unit: "%",
            width: 100,
            height: 100,
            x: 0,
            y: 0,
          });
        };
        img.src = reader.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const scaleX = image!.naturalWidth / image!.width;
    const scaleY = image!.naturalHeight / image!.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.9);
    });
  };

  const handleCropComplete = async () => {
    const croppedImageBlob = await getCroppedImg();
    if (croppedImageBlob) {
      const file = new File([croppedImageBlob], "profile-picture.jpg", {
        type: "image/jpeg",
      });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(croppedImageBlob);
      setPreviewUrl(previewUrl);
      onImageChange(file);
      setImage(null); // Close crop modal
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    onImageChange(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Profile preview"
              width={120}
              height={120}
              className="rounded-full object-cover border-2 border-gray-300 w-32 h-32"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <Camera size={48} className="text-gray-400" />
          </div>
        )}
        
        <label
          htmlFor="profile-picture"
          className={cn(
            "absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100",
            previewUrl && "bottom-2 right-2"
          )}
        >
          <Camera className="h-5 w-5" />
          <input
            id="profile-picture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
        </label>
      </div>

      {/* Crop Modal */}
      {image && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Crop your profile picture</h3>
            
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Force 1:1 aspect ratio for circle
              circularCrop
            >
              <img
                ref={imgRef}
                src={image.src}
                style={{ maxHeight: "70vh", maxWidth: "100%" }}
                onLoad={() => {
                  // Auto-set crop when image loads
                  setCrop({
                    unit: "%",
                    width: 100,
                    height: 100,
                    x: 0,
                    y: 0,
                  });
                }}
              />
            </ReactCrop>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleCropComplete}
                className="flex-1"
              >
                Apply Crop
              </Button>
              <Button
                variant="outline"
                onClick={() => setImage(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        Click the camera icon to upload a profile picture
      </p>
    </div>
  );
}