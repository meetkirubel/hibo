const WORDS_PER_MINUTE = 200; // Average reading speed

/**
 * capitilize a given title
 * @param title - The title to be converted
 * @returns Capitilized title
 */
function capitalize(title: string): string {
  return title
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to extract text from blocks
const extractTextFromBlocks = (blocks) => {
  let text = '';

  blocks.forEach((block) => {
    if (block.children && Array.isArray(block.children)) {
      block.children.forEach((child) => {
        if (child.type === 'text' && child.text) {
          text += ` ${child.text}`;
        }
      });
    }
  });

  return text.trim();
};

// Calculate reading time
const calculateReadingTime = (contentBlocks) => {
  try {
    if (!Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      return 0; // No content, so reading time is 0
    }

    const textContent = extractTextFromBlocks(contentBlocks);
    if (!textContent) return 0; // Prevent division by zero

    const wordCount = textContent.split(/\s+/).filter(Boolean).length; // Remove empty strings
    return Math.ceil(wordCount / WORDS_PER_MINUTE);
  } catch (error) {
    console.error('Reading time calculation error:', error);
    return 0;
  }
};

export { capitalize, calculateReadingTime };
