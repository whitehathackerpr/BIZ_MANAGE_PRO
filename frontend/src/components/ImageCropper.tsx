import React from 'react';
import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  Crop,
} from '@mui/icons-material';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const ImageCropper = ({ image, onCropComplete }) => {
  const cropperRef = useRef(null);
  const [zoom, setZoom] = useState<Type>(1);
  const [rotation, setRotation] = useState<Type>(0);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
      });
      onCropComplete(canvas.toDataURL('image/jpeg'));
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleZoomIn} size="small">
            <ZoomIn />
          </IconButton>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleZoomOut} size="small">
            <ZoomOut />
          </IconButton>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleRotateLeft} size="small">
            <RotateLeft />
          </IconButton>
          <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleRotateRight} size="small">
            <RotateRight />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, px: 2 }}>
          <Slider
            value={zoom}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => (_, value) => setZoom(value)}
            min={0.5}
            max={3}
            step={0.1}
            valueLabelDisplay="auto"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Crop />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCrop}
        >
          Crop
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          height: 400,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Cropper
          ref={cropperRef}
          src={image}
          style={{ height: '100%', width: '100%' }}
          aspectRatio={1}
          viewMode={1}
          guides={true}
          background={true}
          responsive={true}
          autoCropArea={1}
          checkOrientation={false}
          zoom={zoom}
          rotate={rotation}
          cropBoxResizable={true}
          cropBoxMovable={true}
          dragMode="move"
        />
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block', textAlign: 'center' }}
      >
        Drag to move, scroll to zoom, or use the controls above
      </Typography>
    </Box>
  );
};

export default ImageCropper; 