import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface DocsProps {
  url: string;
  size: number;
  onUpload: Function;
}

export default function Docs({ url, size, onUpload }: DocsProps) {
  const storageName = 'docs';
  const [doc_url, setDocUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from(storageName).download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data);
      setDocUrl(url)
    }
    catch (error: any) {
      console.log('Error downloading image: ', error.message)
    }
  }


  async function uploadDocs(event: any) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from(storageName)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    }
    catch (error: any) {
      alert(error.message)
    }
    finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {doc_url ? (
        <img
          src={doc_url}
          alt="Document"
          className="avatar image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadDocs}
          disabled={uploading}
        />
      </div>
    </div>
  )
}