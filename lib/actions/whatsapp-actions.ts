"use server";

type StatusResponse = {
  status: {
    accountStatus: {
      status: string;
      substatus: string;
    }
  }
};

export type ProfileResponse = {
  id: string;
  name: string;
  profile_picture: string;
  is_md: boolean;
  is_business: boolean;
  is_enterprise: boolean;
  battery: string;
  battery_charging: string;
  wa_version: string;
  device: {
    os_version: string;
    platform: string;
    manufacturer: string;
    model: string;
  }
};

/**
 * Check the connection status of the WhatsApp instance
 */
export async function checkWhatsAppStatus() {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "";
    const token = process.env.ULTRAMSG_TOKEN || "";
    
    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as StatusResponse;
    return data;
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    throw error;
  }
}

export async function syncMessages(chatId: string) {
  console.log("🚀 ~ syncMessages ~ chatId:", chatId)
  try {
    if(!chatId) {
      throw new Error('Chat ID is required');
    }
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "";
    const token = process.env.ULTRAMSG_TOKEN || "";
    const response = await fetch(`https://n8n.browserautomations.com/webhook/9330b9d1-760b-4030-8e70-bb584786a5f5`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ chat_id: chatId, instance: instanceId, token: token })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error syncing messages:", error);
    throw error;
  }
}

/**
 * Get WhatsApp profile information
 */
export async function getWhatsAppProfile() {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "";
    const token = process.env.ULTRAMSG_TOKEN || "";
    
    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/me?token=${token}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as ProfileResponse;
    return data;
  } catch (error) {
    console.error("Error getting WhatsApp profile:", error);
    throw error;
  }
}

// Fetch contacts from UltraMsg API
export async function fetchUltraMsgContacts(): Promise<any[]> {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "";
    const token = process.env.ULTRAMSG_TOKEN || "";
    
    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/chats?token=${token}`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching UltraMsg contacts:", error);
    throw error;
  }
}

/**
 * Get QR code for WhatsApp connection
 */
export async function getWhatsAppQRCode() {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "";
    const token = process.env.ULTRAMSG_TOKEN || "";
    
    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/qr?token=${token}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Return the URL directly for the client to fetch the image
    return `https://api.ultramsg.com/${instanceId}/instance/qr?token=${token}`;
  } catch (error) {
    console.error("Error getting WhatsApp QR code:", error);
    throw error;
  }
}

/**
 * Logout from WhatsApp
 */
export async function logoutWhatsApp() {
  try {
    const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "";
    const token = process.env.ULTRAMSG_TOKEN || "";
    
    const response = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/logout`,
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: `token=${token}`,
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging out from WhatsApp:", error);
    throw error;
  }
} 