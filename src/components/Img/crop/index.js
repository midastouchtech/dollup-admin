import React, { useState, useRef } from "react";

import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "./useDebounceEffects";
import { useHolderjs } from "use-holderjs";
import axios from "axios";
import "react-image-crop/dist/ReactCrop.css";

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImgUploadWithCropper(props) {
  useHolderjs();
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [ hasReselectedImage, setHasReselected] = useState(false);

  function onSelectFile(e) {
    setHasReselected(true)
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function upload(file) {
    setIsUploading(true);
    const url = "https://api.cloudinary.com/v1_1/clinic-plus/raw/upload";
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("upload_preset", "pwdsm6sz");
    axios({
      method: "POST",
      data: formData,
      onUploadProgress: (progressEvent) => {
        console.log(progressEvent.loaded);

        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setPercentCompleted(percentCompleted);
        if (percentCompleted === 100) {
          setPercentCompleted(0);
        }
      },
      headers: { "Content-Type": "multipart/form-data" },
      url,
    })
      .then((response) => {
        setIsUploading(false);
        console.log(response.data.secure_url);
        props.onUploadComplete(response.data.secure_url);
      })
      .then((data) => {});
  }

  function onDownloadCropClick(e) {
    e.preventDefault();
    if (!previewCanvasRef.current) {
      throw new Error("Crop canvas does not exist");
    }

    previewCanvasRef.current.toBlob((blob) => {
      console.log(blob);
      let file = new File([blob], fileName);
      upload(file);
    });
  }

  if (!imgSrc && props.src) {
    setImgSrc(props.src);
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );
  let src = `holder.js/${props.width}x${props.height}?`;

  return (
    <div className="App">
      <div className="row">
        <div className="col-sm-6 col-xs-12">
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                crossorigin="anonymous"
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{
                  border: "1px solid black",
                  height: "400px",
                }}
              />
            </ReactCrop>
          )}
          {!imgSrc && (
            <img
              alt="uploaded"
              data-src={src}
              style={{
                border: "1px solid black",
                objectFit: "contain",
                width: "400px",
                height: "400px",
              }}
            />
          )}
        </div>
        <div class="col-sm-6 col-xs-12 custom-file">
          <div className="flex-column align-items-center d-flex justify-content-center">
            <div className="col-md-12 mb-3">
              <input
                type="file"
                class="custom-file-input"
                onChange={onSelectFile}
              />
              <label class="custom-file-label">Choose file</label>
            </div>
          </div>
          <div className="d-flex justify-content-center flex-column mb-3">
            <div
              className="col-md-12 text-center mb-3"
              style={{
                padding: 0,
              }}
            >
              {!!completedCrop && (
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: "200px",
                    height: "200px",
                  }}
                />
              )}
            </div>
            <div
              className="col-md-12 text-center"
              style={{
                padding: 0,
              }}
            >
                <button
                  className="btn btn-primary mb-3"
                  onClick={onDownloadCropClick}
                  disabled={!completedCrop}
                >
                  Upload
                </button>
              {isUploading && <div>Uploading... {percentCompleted}%</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
