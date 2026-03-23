import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const STORAGE_KEY = 'websites_data_v1';

// Health check endpoint
app.get("/make-server-a5bad527/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all websites
app.get("/make-server-a5bad527/websites", async (c) => {
  try {
    const data = await kv.get(STORAGE_KEY);
    return c.json(data || {});
  } catch (error) {
    console.error('Error fetching websites:', error);
    return c.json({ error: 'Failed to fetch websites' }, 500);
  }
});

// Add a website
app.post("/make-server-a5bad527/websites", async (c) => {
  try {
    const { category, website } = await c.req.json();
    
    if (!category || !website) {
      return c.json({ error: 'Missing category or website data' }, 400);
    }

    // Get current data
    let currentData = (await kv.get(STORAGE_KEY)) || {};
    
    // Initialize category array if not exists
    if (!currentData[category]) {
      currentData[category] = [];
    }

    // Add new website to the beginning of the list
    currentData[category] = [website, ...currentData[category]];

    // Save back to storage
    await kv.set(STORAGE_KEY, currentData);

    return c.json({ success: true, data: currentData });
  } catch (error) {
    console.error('Error adding website:', error);
    return c.json({ error: 'Failed to add website' }, 500);
  }
});

// Delete a website
app.delete("/make-server-a5bad527/websites", async (c) => {
  try {
    const { category, url, name } = await c.req.json();
    if (!category || (!url && !name)) {
      return c.json({ error: 'Missing category or identifier (url/name)' }, 400);
    }

    let currentData = (await kv.get(STORAGE_KEY)) || {};
    const list = currentData[category] || [];
    const filtered = list.filter((item: any) => {
      const keepByUrl = url ? item.url !== url : true;
      const keepByName = name ? item.name !== name : true;
      return keepByUrl && keepByName;
    });
    currentData[category] = filtered;
    await kv.set(STORAGE_KEY, currentData);
    return c.json({ success: true, data: currentData });
  } catch (error) {
    console.error('Error deleting website:', error);
    return c.json({ error: 'Failed to delete website' }, 500);
  }
});

// Seed initial data (optional, called by frontend if empty)
app.post("/make-server-a5bad527/seed", async (c) => {
  try {
    const { data } = await c.req.json();
    await kv.set(STORAGE_KEY, data);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to seed data' }, 500);
  }
});

Deno.serve(app.fetch);
