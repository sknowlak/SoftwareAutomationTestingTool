// Types for detected actions
export interface DetectedAction {
  type: 'click' | 'input' | 'navigation' | 'scroll' | 'hover' | 'keypress';
  timestamp: number;
  x?: number;
  y?: number;
  element?: string;
  value?: string;
  keyCode?: number;
}

export interface AnalysisResult {
  actions: DetectedAction[];
  duration: number;
  resolution: { width: number; height: number };
}

/**
 * Memory-efficient video analysis service
 * For this demo, we'll simulate the analysis with some predefined actions
 */
export const analyzeVideo = async (videoBlob: Blob): Promise<AnalysisResult> => {
  try {
    // Limit the video size to prevent memory issues
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    if (videoBlob.size > MAX_VIDEO_SIZE) {
      console.warn(`Video size (${(videoBlob.size / (1024 * 1024)).toFixed(2)}MB) exceeds limit. Using first ${(MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(2)}MB for analysis.`);
      // Create a smaller blob to work with
      videoBlob = videoBlob.slice(0, MAX_VIDEO_SIZE);
    }

    // For demo purposes, we'll simulate the analysis with a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get video duration and metadata - with timeout protection
    const videoDuration = await Promise.race([
      getVideoDuration(videoBlob),
      new Promise<number>((_, reject) => setTimeout(() => reject(new Error('Video duration timeout')), 5000))
    ]).catch(() => 30); // Default to 30 seconds if timeout

    const videoResolution = await Promise.race([
      getVideoResolution(videoBlob),
      new Promise<{width: number, height: number}>((_, reject) =>
        setTimeout(() => reject(new Error('Video resolution timeout')), 5000))
    ]).catch(() => ({ width: 1280, height: 720 })); // Default resolution if timeout

    // Limit the number of actions to prevent memory issues
    const MAX_ACTIONS = 50;
    const estimatedActions = Math.floor(videoDuration / 2);
    const actionCount = Math.min(estimatedActions, MAX_ACTIONS);

    // Generate simulated actions based on the video duration
    const actions = generateSimulatedActions(videoDuration, actionCount);

    return {
      actions,
      duration: videoDuration,
      resolution: videoResolution
    };
  } catch (error) {
    console.error('Error analyzing video:', error);
    // Return fallback data to prevent complete failure
    return {
      actions: generateSimulatedActions(30, 15), // Generate 15 actions for a 30-second video
      duration: 30,
      resolution: { width: 1280, height: 720 }
    };
  }
};

/**
 * Get the duration of a video blob with error handling
 */
const getVideoDuration = async (videoBlob: Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      // Add error handler
      video.onerror = (e) => {
        window.URL.revokeObjectURL(video.src);
        console.error('Error loading video metadata:', e);
        reject(new Error('Failed to load video metadata'));
      };

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration || 30); // Fallback to 30 seconds if duration is 0 or NaN
      };

      // Create object URL with error handling
      try {
        video.src = URL.createObjectURL(videoBlob);
      } catch (e) {
        console.error('Error creating object URL:', e);
        reject(new Error('Failed to create video URL'));
      }

      // Set a timeout in case the metadata never loads
      setTimeout(() => {
        if (!video.duration) {
          window.URL.revokeObjectURL(video.src);
          reject(new Error('Video metadata load timeout'));
        }
      }, 3000);
    } catch (e) {
      console.error('Unexpected error in getVideoDuration:', e);
      reject(e);
    }
  });
};

/**
 * Get the resolution of a video blob with error handling
 */
const getVideoResolution = async (videoBlob: Blob): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      // Add error handler
      video.onerror = (e) => {
        window.URL.revokeObjectURL(video.src);
        console.error('Error loading video for resolution:', e);
        reject(new Error('Failed to load video for resolution'));
      };

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        // Use default values if dimensions are 0
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        resolve({ width, height });
      };

      // Create object URL with error handling
      try {
        video.src = URL.createObjectURL(videoBlob);
      } catch (e) {
        console.error('Error creating object URL for resolution:', e);
        reject(new Error('Failed to create video URL for resolution'));
      }

      // Set a timeout in case the metadata never loads
      setTimeout(() => {
        if (!video.videoWidth || !video.videoHeight) {
          window.URL.revokeObjectURL(video.src);
          reject(new Error('Video resolution metadata load timeout'));
        }
      }, 3000);
    } catch (e) {
      console.error('Unexpected error in getVideoResolution:', e);
      reject(e);
    }
  });
};

/**
 * Generate simulated actions based on video duration with memory optimization
 * In a real implementation, this would be replaced with actual detected actions
 */
const generateSimulatedActions = (duration: number, maxActions: number = 50): DetectedAction[] => {
  try {
    const actions: DetectedAction[] = [];
    // Limit the number of actions to prevent memory issues
    const actionCount = Math.min(Math.floor(duration / 2), maxActions); // Roughly one action every 2 seconds, capped at maxActions

    // Pre-define action types to avoid recreating the array in the loop
    const actionTypes: DetectedAction['type'][] = ['click', 'input', 'navigation', 'scroll', 'hover', 'keypress'];

    // Generate actions in chunks to prevent UI freezing
    const CHUNK_SIZE = 10;
    const numChunks = Math.ceil(actionCount / CHUNK_SIZE);

    for (let chunk = 0; chunk < numChunks; chunk++) {
      const startIdx = chunk * CHUNK_SIZE;
      const endIdx = Math.min(startIdx + CHUNK_SIZE, actionCount);

      for (let i = startIdx; i < endIdx; i++) {
        const timestamp = i * 2 + Math.random(); // Add some randomness
        const type = actionTypes[Math.floor(Math.random() * actionTypes.length)];

        const action: DetectedAction = {
          type,
          timestamp,
          x: Math.floor(Math.random() * 1000),
          y: Math.floor(Math.random() * 800),
        };

        // Add type-specific properties
        if (type === 'click' || type === 'hover') {
          action.element = getRandomElement();
        } else if (type === 'input') {
          action.element = getRandomElement('input');
          action.value = getRandomText();
        } else if (type === 'keypress') {
          action.keyCode = Math.floor(Math.random() * 90) + 32; // ASCII range
        }

        actions.push(action);
      }
    }

    return actions;
  } catch (error) {
    console.error('Error generating simulated actions:', error);
    // Return a minimal set of actions as fallback
    return [
      { type: 'click', timestamp: 1, x: 500, y: 400, element: 'button.submit-btn' },
      { type: 'input', timestamp: 3, element: 'input#username', value: 'test@example.com' },
      { type: 'navigation', timestamp: 5, x: 0, y: 0 }
    ];
  }
};

/**
 * Get a random element selector for simulation
 */
const getRandomElement = (type: string = ''): string => {
  const elements = [
    'button.submit-btn',
    'input#username',
    'input#password',
    'a.nav-link',
    'div.dropdown-menu',
    'span.icon',
    'input[type="checkbox"]',
    'select#country',
    'textarea#comments',
    'label.form-check-label'
  ];

  if (type) {
    return elements.filter(e => e.startsWith(type))[0] || elements[0];
  }

  return elements[Math.floor(Math.random() * elements.length)];
};

/**
 * Get random text for input simulation
 */
const getRandomText = (): string => {
  const texts = [
    'user123',
    'password123',
    'test@example.com',
    'John Doe',
    'New York',
    'This is a comment',
    'Search query',
    '12345',
    'https://example.com',
    'Product name'
  ];

  return texts[Math.floor(Math.random() * texts.length)];
};
