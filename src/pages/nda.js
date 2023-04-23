import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  input {
    width: 400px;
    text-align: left;
    &::-webkit-file-upload-button {
      visibility: hidden;
    }
    &::before {
      content: "Select a file";
      display: inline-block;
      background: linear-gradient(top, #f9f9f9, #e3e3e3);
      border: 1px solid #999;
      border-radius: 3px;
      padding: 5px 8px;
      outline: none;
      white-space: nowrap;
      -webkit-user-select: none;
      cursor: pointer;
      font-weight: 300;
      font-size: 10pt;
    }
    &:hover {
      &::before {
        border-color: black;
      }
    }
    &:active {
      &::before {
        background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
      }
    }
  }
`;

function Uploader({ title, onChange }) {
  const [isUploading, setIsUploading] = useState(null);

  const onFileChange = (event) => {
    setIsUploading(true);
    const url = "https://api.cloudinary.com/v1_1/clinic-plus/raw/upload";
    const formData = new FormData();
    formData.append("file", event.target.files[0], event.target.files[0].name);
    formData.append("upload_preset", "pwdsm6sz");
    axios({
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      url,
    })
      .then((response) => {
        setIsUploading(false);
        onChange(response.data.secure_url);
      })
      .then((data) => {});
  };

  return (
    <div class="form-group text-center">
      <input
        onChange={onFileChange}
        type="file"
        class="form-control-file"
        id="exampleFormControlFile1"
      />
      {isUploading === true && <small>Uploading...</small>}
      {isUploading === false && <small>Upload complete!</small>}
    </div>
  );
}

export default Uploader;
