// src/hooks/useSeoMeta.tsx
import { useEffect } from 'react';

const useSeoMeta = () => {
  useEffect(() => {
    // Check if the variables are available
    if (import.meta.env.VITE_APP_NAME) {
      document.title = import.meta.env.VITE_APP_NAME;

      // Update the description meta tag
      const descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.content = import.meta.env.VITE_APP_DESCRIPTION || '';
      }

      // Update Open Graph and Twitter tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = import.meta.env.VITE_APP_NAME;

      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.content = import.meta.env.VITE_APP_NAME;
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = import.meta.env.VITE_APP_URL;

      const twitterCreator = document.querySelector('meta[name="twitter:creator"]');
      if (twitterCreator) twitterCreator.content = import.meta.env.VITE_TWITTER_HANDLE;

      // Repeat for other meta tags...
    }
  }, []); // The empty dependency array ensures this effect runs only once
};

export default useSeoMeta;