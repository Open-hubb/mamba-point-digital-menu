/**
 * One-time extraction script: parses the current index.html
 * and outputs menu_data.json with all menu items, sections, groups, and branding.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const htmlPath = path.join(__dirname, '..', 'index.html');
const outputPath = path.join(__dirname, '..', 'menu_data.json');

const html = fs.readFileSync(htmlPath, 'utf-8');
const $ = cheerio.load(html);

// --- SECTION GROUP MAP (matches the JS in index.html) ---
const sectionGroupMap = {
  'starters':'food','salads':'food','main-course':'food','cold-mezza':'food','hot-mezza':'food',
  'charcoal-grilled-platter':'food','cape-sandwiches':'food','soups':'food','burger-section':'food',
  'african-dish':'food','pastry-desserts':'food',
  'beer':'beverages','soft-drinks':'beverages','juices':'beverages','hot-beverages':'beverages',
  'cold-beverages':'beverages','energy-drinks':'beverages','mocktails':'beverages','cocktails':'beverages',
  'shots':'beverages','bottles':'beverages','wine':'beverages','champagne':'beverages',
  'sushi-soups':'sushi','sushi-starters':'sushi','sashimi':'sushi','nigiri':'sushi','hoso-maki':'sushi',
  'crispy-maki':'sushi','uramaki':'sushi','temaki':'sushi','sushi-specialty':'sushi',
  'sushi-main-course':'sushi','sushi-platters':'sushi','sushi-desserts':'sushi',
  'pizza':'italian-bar','pasta':'italian-bar',
  'desserts':'pastry',
  'indian-starters':'indian','indian-main-course':'indian','indian-biryani':'indian','indian-sides':'indian'
};

// --- GROUPS ---
const groupOrder = ['food', 'beverages', 'sushi', 'italian-bar', 'pastry', 'indian'];
const groupLabels = {
  'food': 'Food',
  'beverages': 'Beverages',
  'sushi': 'Sushi',
  'italian-bar': 'Italian Bar',
  'pastry': 'Pastry',
  'indian': 'Indian Menu'
};

const groups = groupOrder.map((id, i) => ({
  id,
  label: groupLabels[id],
  sortOrder: i
}));

// --- BRANDING ---
const branding = {
  restaurantName: $('.brand-title').text().trim() || 'Cape Leisure Club',
  subtitle: $('.brand-subtitle').text().trim() || 'Mamba Point',
  tinNumber: $('.tin-number').text().trim() || 'TIN# 1000003124',
  phone: '099100100',
  logoUrl: './images-removebg-preview.png',
  checkoutUrl: $('iframe.modal-iframe').attr('data-src') || 'https://pay.flotme.ai/lagoonda',
  currency: 'LE',
  footerText: 'Powered by',
  footerLinkText: 'Flot Business',
  footerLinkUrl: 'https://www.flotme.ai/business',
  ogImageUrl: 'https://capeleisure.vercel.app/og-image.png'
};

// --- SECTIONS & ITEMS ---
const sections = [];
let sectionSortByGroup = {};

$('.menu-section').each(function (sectionIndex) {
  const sectionEl = $(this);
  const sectionId = sectionEl.attr('id');
  const groupId = sectionGroupMap[sectionId];

  if (!groupId) {
    console.warn(`WARNING: Section "${sectionId}" not found in sectionGroupMap, skipping.`);
    return;
  }

  // Track sort order within group
  if (!sectionSortByGroup[groupId]) sectionSortByGroup[groupId] = 0;
  const sortOrder = sectionSortByGroup[groupId]++;

  const title = sectionEl.find('.section-title').first().text().trim();

  // Extract items
  const items = [];
  let currentSubHeader = null;

  sectionEl.find('.menu-list').children().each(function () {
    const child = $(this);

    // Check if this is a sub-header
    if (child.hasClass('menu-sub-header')) {
      currentSubHeader = child.text().trim();
      return; // continue to next child
    }

    // Check if this is a menu item
    if (child.hasClass('menu-item')) {
      const name = child.attr('data-name') || child.find('.menu-item-title').text().trim();
      const price = parseInt(child.attr('data-price'), 10) || 0;
      const desc = child.find('.menu-item-desc').text().trim() || null;
      const itemNum = child.find('.item-number').text().trim() || null;

      const tags = [];
      child.find('.tag').each(function () {
        const tagText = $(this).text().trim().toUpperCase();
        if (['V', 'VG', 'GF'].includes(tagText)) {
          tags.push(tagText);
        }
      });

      items.push({
        name,
        price,
        description: desc,
        itemNumber: itemNum,
        tags,
        subHeader: currentSubHeader
      });
    }
  });

  sections.push({
    id: sectionId,
    title,
    groupId,
    sortOrder,
    items
  });
});

// --- BUILD OUTPUT ---
const menuData = {
  version: 1,
  lastModified: new Date().toISOString(),
  branding,
  groups,
  sections
};

// --- VALIDATE ---
console.log('\n=== EXTRACTION RESULTS ===\n');
console.log(`Groups: ${groups.length}`);
console.log(`Sections: ${sections.length}`);

let totalItems = 0;
const sectionCounts = {};
sections.forEach(s => {
  sectionCounts[s.id] = s.items.length;
  totalItems += s.items.length;
});
console.log(`Total items: ${totalItems}\n`);

// Cross-check against HTML section counts
console.log('--- Section count validation ---');
let mismatches = 0;
$('.menu-section').each(function () {
  const id = $(this).attr('id');
  const countText = $(this).find('.section-count').text().trim();
  const htmlCount = parseInt(countText, 10);
  const extractedCount = sectionCounts[id] || 0;

  const match = htmlCount === extractedCount ? 'OK' : 'MISMATCH';
  if (match === 'MISMATCH') mismatches++;
  console.log(`  ${id}: HTML=${htmlCount}, Extracted=${extractedCount} [${match}]`);
});

if (mismatches > 0) {
  console.log(`\n*** ${mismatches} MISMATCHES found! Check extraction logic. ***\n`);
} else {
  console.log('\nAll section counts match. Extraction is clean.\n');
}

// Show items per group
console.log('--- Items per group ---');
groups.forEach(g => {
  const groupSections = sections.filter(s => s.groupId === g.id);
  const groupItems = groupSections.reduce((sum, s) => sum + s.items.length, 0);
  console.log(`  ${g.label}: ${groupSections.length} sections, ${groupItems} items`);
});

// --- WRITE OUTPUT ---
fs.writeFileSync(outputPath, JSON.stringify(menuData, null, 2));
console.log(`\nWrote ${outputPath}`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
