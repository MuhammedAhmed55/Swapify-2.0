"use server";

type WahaStatusResponse = {
  name: string;
  status: string;
  me?: {
    id: string;
    pushName: string;
  };
  config: {
    metadata: Record<string, string>;
    webhooks: any[];
  };
  engine?: {
    engine: string;
    WWebVersion: string;
    state: any;
  };
};

export type WahaProfileResponse = {
  id: string;
  picture: string;
  name: string;
};

/**
 * Check the connection status of the WahaPro WhatsApp instance
 */
export async function checkWahaWhatsAppStatus() {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    const response = await fetch(`${baseUrl}/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as WahaStatusResponse;
    console.log("🚀 ~ checkWahaWhatsAppStatus ~ data:", data);
    return data;
  } catch (error) {
    console.error("Error checking WahaPro WhatsApp status:", error);
    throw error;
  }
}

export interface WahaContactResponse {
  id: string;
  number: string;
  isBusiness: boolean;
  labels: string[];
  name: string;
  shortName?: string;
  type: string;
  isMe: boolean;
  isUser: boolean;
  isGroup: boolean;
  isWAContact: boolean;
  isMyContact: boolean;
  isBlocked: boolean;
}

export interface WahaChatResponse {
  id: {
    server: string;
    user: string;
    _serialized: string;
  };
  name: string;
  timestamp: number;
}

export interface WahaMessageResponse {
  id: string;
  timestamp: number;
  from: string;
  fromMe: boolean;
  source: string;
  to: string;
  body: string;
  hasMedia: boolean;
  media?: {
    url: string;
    filename: string;
    mimetype: string;
  };
  mediaUrl?: string;
  ack: number;
  ackName: string;
  vCards: any[];
  _data: {
    id: {
      fromMe: boolean;
      remote: string;
      id: string;
      _serialized: string;
    };
    rowId: number;
    viewed: boolean;
    body: string;
    type: string;
    t: number;
    from: {
      server: string;
      user: string;
      _serialized: string;
    };
    to: {
      server: string;
      user: string;
      _serialized: string;
    };
    author: {
      server: string;
      user: string;
      device: number;
      _serialized: string;
    };
    ack: number;
    invis: boolean;
    star: boolean;
    isForwarded: boolean;
    quotedMsg: {
      id: string;
      from: string;
      to: string;
      body: string;
    };
    mentionedJidList: string[];
    isMentioned: boolean;
  };
}

export async function fetchWahaProContacts(
  limit: number = 3000,
  offset: number = 0
): Promise<WahaContactResponse[]> {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    const response = await fetch(
      `${baseUrl}/contacts/all?session=${sessionId}&sortOrder=asc&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as WahaContactResponse[];
    console.log("🚀 ~ fetchWahaProContacts ~ data:", data.length);
    return data;
  } catch (error) {
    console.error("Error fetching WahaPro WhatsApp contacts:", error);
    throw error;
  }
}

export async function fetchWahaProChats(
  limit: number = 3000,
  offset: number = 0
): Promise<WahaChatResponse[]> {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    const response = await fetch(
      `${baseUrl}/${sessionId}/chats?sortOrder=asc&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as WahaChatResponse[];
    console.log("🚀 ~ fetchWahaProChats ~ data:", data.length);
    return data;
  } catch (error) {
    console.error("Error fetching WahaPro WhatsApp chats:", error);
    throw error;
  }
}

/**
 * Get WahaPro WhatsApp profile information
 */
export async function getWahaWhatsAppProfile() {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    const response = await fetch(`${baseUrl}/${sessionId}/profile`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as WahaProfileResponse;
    console.log("🚀 ~ getWahaWhatsAppProfile ~ data:", data);
    return data;
  } catch (error) {
    console.error("Error getting WahaPro WhatsApp profile:", error);
    throw error;
  }
}

/**
 * Get WahaPro WhatsApp profile information
 */
export async function getWahaWhatsAppMessages(
  chatId: string,
  offset: number = 0,
  limit: number = 1000
) {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    const url = `${baseUrl}/${sessionId}/chats/${chatId}/messages?downloadMedia=true&limit=${limit}&offset=${offset}`;
    console.log("🚀 ~ getWahaWhatsAppMessages ~ url:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as WahaMessageResponse[];
    console.log("🚀 ~ getWahaWhatsAppProfile ~ data:", data);
    return data;
  } catch (error) {
    console.error("Error getting WahaPro WhatsApp messages:", error);
    throw error;
  }
}

/**
 * Get QR code for WahaPro WhatsApp connection
 */
export async function getWahaWhatsAppQRCode() {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    // Return the URL directly for the client to fetch the image
    return `${baseUrl}/${sessionId}/auth/qr?format=image`;
  } catch (error) {
    console.error("Error getting WahaPro WhatsApp QR code:", error);
    throw error;
  }
}

/**
 * Logout from WahaPro WhatsApp
 */
export async function logoutWahaWhatsApp() {
  try {
    const sessionId = process.env.WAHAPRO_SESSION_ID || "default";
    const baseUrl =
      process.env.WAHAPRO_BASE_URL ||
      "https://wahapro.browserautomations.com/api";

    const response = await fetch(`${baseUrl}/sessions/${sessionId}/logout`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging out from WahaPro WhatsApp:", error);
    throw error;
  }
}
