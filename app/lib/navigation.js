// lib/navigation.js
const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__;

export const getDetailUrl = (type, id) => {
  if (isTauri) {
    return `/details?type=${type}&id=${id}`;
  }
  return `/${type}/${id}`;
};

export const getPersonUrl = (id) => {
  if (isTauri) {
    return `/details?type=person&id=${id}`;
  }
  return `/person/${id}`;
};
