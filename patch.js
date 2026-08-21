const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const hookCode = `  // Handle storage and bfcache sync for media
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedPhotos = localStorage.getItem(STORAGE_KEYS.ACTION_PHOTOS);
        if (savedPhotos) {
          const parsed = JSON.parse(savedPhotos);
          if (Array.isArray(parsed)) setActionPhotos(parsed);
        }
        
        const savedAlbums = localStorage.getItem(STORAGE_KEYS.GOOGLE_PHOTOS_ALBUMS);
        if (savedAlbums) {
          const parsed = JSON.parse(savedAlbums);
          if (Array.isArray(parsed)) setGooglePhotosAlbums(parsed);
        }
        
        const savedMaster = localStorage.getItem(STORAGE_KEYS.MASTER_ALBUM_INFO);
        if (savedMaster) {
          const parsed = JSON.parse(savedMaster);
          if (parsed && parsed.url) setMasterAlbumInfo(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('daf_media_updated', handleStorageChange);
    window.addEventListener('pageshow', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('daf_media_updated', handleStorageChange);
      window.removeEventListener('pageshow', handleStorageChange);
    };
  }, []);

  // Admin Mode Toggle (Hide triggers from public via URL query parameter)`;

code = code.replace('  // Admin Mode Toggle (Hide triggers from public via URL query parameter)', hookCode);
fs.writeFileSync('src/App.tsx', code);
