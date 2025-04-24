import { env } from "@/env";

export async function uploadToBackblaze(file: File): Promise<string> {
  try {
    // Step 1: Get authorization token
    const authResponse = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${env.BACKBLAZE_KEY_ID}:${env.BACKBLAZE_APP_KEY}`).toString("base64")}`,
      },
    });

    if (!authResponse.ok) {
      throw new Error(`B2 authorization failed: ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    const { apiUrl, authorizationToken, downloadUrl } = authData;

    // Step 2: Get upload URL
    const getUploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: "POST",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId: env.BACKBLAZE_BUCKET_ID,
      }),
    });

    if (!getUploadUrlResponse.ok) {
      throw new Error(`B2 get upload URL failed: ${getUploadUrlResponse.statusText}`);
    }

    const { uploadUrl, authorizationToken: uploadAuthToken } = await getUploadUrlResponse.json();

    // Step 3: Upload the file
    const buffer = await file.arrayBuffer();
    const fileName = `task-images/${Date.now()}_${encodeURIComponent(file.name)}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadAuthToken,
        "Content-Type": file.type || "application/octet-stream",
        "Content-Length": String(file.size),
        "X-Bz-File-Name": fileName,
        "X-Bz-Content-Sha1": "do_not_verify", // For simplicity
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`B2 upload failed: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    
    // Return the public URL for direct downloads
    return `${downloadUrl}/file/${env.BACKBLAZE_BUCKET_ID}/${uploadResult.fileName}`;
  } catch (error) {
    console.error("Error uploading to Backblaze:", error);
    throw error;
  }
} 