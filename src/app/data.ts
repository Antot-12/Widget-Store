import type { Widget } from "@/lib/types";

const defaultKeyFeatures = [
    "Seamless integration with your existing workflow.",
    "Real-time data synchronization across all devices.",
    "Customizable themes and layout options.",
    "Accessible design for all users (WCAG 2.1 compliant).",
    "Advanced analytics and reporting dashboard.",
    "Automated alerts and smart notifications.",
    "Offline mode for uninterrupted productivity.",
    "Secure data encryption (end-to-end).",
];

const defaultWhatsNew = `
**Version 2.0.1**
This latest version introduces a redesigned user interface for better readability, performance enhancements for quicker load times, and three new data visualization options. We've also squashed some bugs for a smoother experience.
`;

const defaultMoreInfo = `
| Key | Value |
| --- | --- |
| **Version** | 2.0.1 |
| **Languages** | English, Spanish |
| **Permissions** | [view details](#) |
| **Developer** | WidgetBuilders Inc. |
| **Website** | [view website](#) |
`;

export const ALL_WIDGETS: Widget[] = [
    { 
        id: '1', 
        name: 'ChronoFlow', 
        description: 'Track your time with unparalleled precision and style. Integrates with your calendar.', 
        category: 'Productivity', 
        imageUrl: 'https://picsum.photos/400/225?random=1', 
        imageHint: 'abstract gradient', 
        tags: ['time management', 'calendar'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '2', 
        name: 'NexusConnect', 
        description: 'Stay connected with all your social media feeds in one unified dashboard.', 
        category: 'Social', 
        imageUrl: 'https://picsum.photos/400/225?random=2', 
        imageHint: 'social network', 
        tags: ['friends', 'updates'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '3', 
        name: 'AtmoSphere', 
        description: 'Get hyper-local weather forecasts with stunning visualizations and alerts.', 
        category: 'Weather', 
        imageUrl: 'https://picsum.photos/400/225?random=3', 
        imageHint: 'weather map', 
        tags: ['forecast', 'climate'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '4', 
        name: 'CodeStream', 
        description: 'A scratchpad for developers. Test code snippets in any language, instantly.', 
        category: 'Productivity', 
        imageUrl: 'https://picsum.photos/400/225?random=4', 
        imageHint: 'code editor', 
        tags: ['development', 'testing'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '5', 
        name: 'SoundWeave', 
        description: 'Discover and share music with a next-gen social music platform.', 
        category: 'Music', 
        imageUrl: 'https://picsum.photos/400/225?random=5', 
        imageHint: 'music waveform', 
        tags: ['playlist', 'discovery'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '6', 
        name: 'TaskMaster', 
        description: 'The ultimate to-do list and project management tool for power users.', 
        category: 'Productivity', 
        imageUrl: 'https://picsum.photos/400/225?random=6', 
        imageHint: 'kanban board', 
        tags: ['projects', 'to-do'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '7', 
        name: 'CardioFit', 
        description: 'Track your runs, analyze your performance, and reach your fitness goals.', 
        category: 'Health', 
        imageUrl: 'https://picsum.photos/400/225?random=7', 
        imageHint: 'running shoes', 
        tags: ['running', 'fitness'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '8', 
        name: 'Zenith', 
        description: 'Find your calm with guided meditations and mindfulness exercises.', 
        category: 'Health', 
        imageUrl: 'https://picsum.photos/400/225?random=8', 
        imageHint: 'meditation landscape', 
        tags: ['meditation', 'mindfulness'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '9', 
        name: 'TuneTrove', 
        description: 'Your personal DJ. Creates playlists based on your mood and activity.', 
        category: 'Music', 
        imageUrl: 'https://picsum.photos/400/225?random=9', 
        imageHint: 'headphones abstract', 
        tags: ['DJ', 'mood'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '10', 
        name: 'StormChaser', 
        description: 'Real-time storm tracking and severe weather alerts.', 
        category: 'Weather', 
        imageUrl: 'https://picsum.photos/400/225?random=10', 
        imageHint: 'stormy sky', 
        tags: ['radar', 'alerts'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '11', 
        name: 'Glimpse', 
        description: 'Share ephemeral photo stories with your closest friends.', 
        category: 'Social', 
        imageUrl: 'https://picsum.photos/400/225?random=11', 
        imageHint: 'camera lens', 
        tags: ['photos', 'stories'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
    { 
        id: '12', 
        name: 'NutriTrack', 
        description: 'Log your meals and track your nutrition with ease.', 
        category: 'Health', 
        imageUrl: 'https://picsum.photos/400/225?random=12', 
        imageHint: 'healthy food', 
        tags: ['calories', 'diet'],
        keyFeatures: defaultKeyFeatures,
        whatsNew: defaultWhatsNew,
        moreInfo: defaultMoreInfo,
    },
];
