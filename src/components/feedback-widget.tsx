"use client"; // NextJS 13 requires this. Remove if you are using NextJS 12 or lower
import { useEffect } from "react";
import Script from "next/script";

const FeedbackWidget = () => {
  useEffect(() => {
    const win = window as any;

    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        // eslint-disable-next-line prefer-rest-params
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    win.Featurebase("initialize_portal_widget", {
      organization: 'doctordok', // Replace this with your organization name, copy-paste the subdomain part from your Featurebase workspace url (e.g. https://*yourorg*.featurebase.app)
      fullScreen: false, // optional
      initialPage: 'CreatePost', // optional (MainView, RoadmapView, CreatePost, PostsView, ChangelogView)
      locale: "en", // Change the language, view all available languages from https://help.featurebase.app/en/articles/8879098-using-featurebase-in-my-language
      metadata: null // Attach session-specific metadata to feedback. Refer to the advanced section for the details: https://help.featurebase.app/en/articles/3774671-advanced#7k8iriyap66
    });
  }, []);

  return (
    <>
      <Script src="https://do.featurebase.app/js/sdk.js" id="featurebase-sdk" />
    </>
  );
};

export default FeedbackWidget;