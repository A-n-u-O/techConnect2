"use client";

import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

export default function ProfilePictureUpload() {
  const [upImg, setUpImg] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoaded = (img: HTMLImageElement) => {
    imgRef.current = img;
  };

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

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

  const handleUpload = async () => {
    const croppedImg = await getCroppedImg();
    if (croppedImg) {
      // TODO: Upload croppedImg to your backend / Supabase storage
      console.log("Cropped image blob:", croppedImg);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!upImg ? (
        <label className="cursor-pointer flex flex-col items-center">
          <Camera className="w-12 h-12 text-gray-500" />
          <span className="text-sm text-gray-500">Upload a photo</span>
          <input type="file" accept="image/*" onChange={onSelectFile} hidden />
        </label>
      ) : (
        <>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img ref={imgRef} alt="Crop me" src={upImg} onLoad={(e) => onImageLoaded(e.currentTarget)} />
          </ReactCrop>

          <div className="flex space-x-2">
            <Button onClick={handleUpload}>Save</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setUpImg(null);
                setCrop(undefined);
                setCompletedCrop(undefined);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}