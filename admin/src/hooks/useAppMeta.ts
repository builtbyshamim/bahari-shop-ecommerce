import { useEffect } from 'react';
import { useGetCompanyInfoQuery } from '../features/settings/company-info/companyApi';

export const useAppMeta = () => {
  const { data } = useGetCompanyInfoQuery(undefined);
  const info = data?.data;

  useEffect(() => {
    if (!info) return;

    if (info.name) {
      document.title = `${info.name} — Admin`;
    }

    if (info.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        document.head.appendChild(link);
      }
      link.rel = 'icon';
      link.href = info.faviconUrl;
    }
  }, [info]);
};
