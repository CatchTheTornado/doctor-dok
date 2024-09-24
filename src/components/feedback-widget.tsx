"use client"; // NextJS 13 requires this. Remove if you are using NextJS 12 or lower
import { useEffect } from "react";
import Script from "next/script";

const FeedbackWidget = () => {
  return (
    <>
      <Script src="https://w.appzi.io/w.js?token=TtIV6"  />
    </>
  );
};

export default FeedbackWidget;