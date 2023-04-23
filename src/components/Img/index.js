import React, { useState } from "react";
import { useHolderjs } from "use-holderjs";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const Img = (props) => {
  useHolderjs();
  const [crop, setCrop] = useState();

  let { width, height } = props;

  // placeholder
  if (!props.src) {
    let src = `holder.js/${width}x${height}?`;

    return <img data-src={src} />;
  }
  // real
  else {
    return (
      <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
        <img src={props.src} />
      </ReactCrop>
    );
  }
};

export default Img;
