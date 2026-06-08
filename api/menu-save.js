import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check auth
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const menuData = req.body;

    // Basic validation
    if (!menuData || !menuData.branding || !menuData.groups || !menuData.sections) {
      return res.status(400).json({ error: 'Invalid menu data structure' });
    }

    // Update metadata
    menuData.version = (menuData.version || 0) + 1;
    menuData.lastModified = new Date().toISOString();

    await put('menu_data.json', JSON.stringify(menuData, null, 2), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false
    });

    return res.status(200).json({
      success: true,
      version: menuData.version,
      lastModified: menuData.lastModified
    });
  } catch (err) {
    console.error('Failed to save menu:', err);
    return res.status(500).json({ error: 'Failed to save menu' });
  }
}
