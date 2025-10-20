-- Sample Data for Widget Store
-- This script provides sample widgets with all frontend-required fields

-- Note: Run this after the application creates the tables
-- You may need to adjust user_id values based on your database

-- Insert sample widgets
INSERT INTO widget (id, name, description, category, icon_url, file_url, image_hint, downloads, size_bytes, whats_new, more_info, created_by_id)
VALUES
(1, 'ChronoFlow',
 'Track your time with unparalleled precision and style. Integrates with your calendar and provides detailed analytics.',
 'Productivity',
 'https://picsum.photos/400/225?random=1',
 'https://example.com/widgets/chronoflow.zip',
 'abstract gradient',
 1250,
 2048000,
 '**Version 2.1.0**
This latest version introduces a redesigned user interface for better readability, performance enhancements for quicker load times, and three new visualization options. Calendar integration has been improved with better sync capabilities.',
 '| Key | Value |
| --- | --- |
| **Version** | 2.1.0 |
| **Languages** | English, Spanish |
| **Permissions** | Calendar, Notifications |
| **Developer** | TimeTrack Solutions |
| **Website** | [timetrack.io](https://timetrack.io) |',
 NULL);

INSERT INTO widget (id, name, description, category, icon_url, file_url, image_hint, downloads, size_bytes, whats_new, more_info, created_by_id)
VALUES
(2, 'NexusConnect',
 'Stay connected with all your social media feeds in one unified dashboard. Never miss an update.',
 'Social',
 'https://picsum.photos/400/225?random=2',
 'https://example.com/widgets/nexusconnect.zip',
 'social network',
 3420,
 3145728,
 '**Version 3.0.1**
Major update with support for 5 additional social networks. Improved notification system and better privacy controls. Dark mode is now available.',
 '| Key | Value |
| --- | --- |
| **Version** | 3.0.1 |
| **Languages** | English, French, German |
| **Permissions** | Network Access, Notifications |
| **Developer** | SocialHub Inc |
| **Website** | [socialhub.io](https://socialhub.io) |',
 NULL);

INSERT INTO widget (id, name, description, category, icon_url, file_url, image_hint, downloads, size_bytes, whats_new, more_info, created_by_id)
VALUES
(3, 'AtmoSphere',
 'Get hyper-local weather forecasts with stunning visualizations and severe weather alerts.',
 'Weather',
 'https://picsum.photos/400/225?random=3',
 'https://example.com/widgets/atmosphere.zip',
 'weather map',
 5680,
 1572864,
 '**Version 1.5.2**
Enhanced weather radar with 3D visualization. Added pollen forecasts and air quality index. Improved accuracy for 10-day forecasts.',
 '| Key | Value |
| --- | --- |
| **Version** | 1.5.2 |
| **Languages** | English |
| **Permissions** | Location, Notifications |
| **Developer** | WeatherTech Labs |
| **Website** | [weathertech.com](https://weathertech.com) |',
 NULL);

INSERT INTO widget (id, name, description, category, icon_url, file_url, image_hint, downloads, size_bytes, whats_new, more_info, created_by_id)
VALUES
(4, 'CodeStream',
 'A scratchpad for developers. Test code snippets in any language, instantly.',
 'Productivity',
 'https://picsum.photos/400/225?random=4',
 'https://example.com/widgets/codestream.zip',
 'code editor',
 2890,
 4194304,
 '**Version 2.3.0**
Added support for 15 new programming languages. Improved syntax highlighting and auto-completion. Now includes code sharing capabilities.',
 '| Key | Value |
| --- | --- |
| **Version** | 2.3.0 |
| **Languages** | English, Japanese |
| **Permissions** | File System |
| **Developer** | DevTools Co |
| **Website** | [devtools.dev](https://devtools.dev) |',
 NULL);

INSERT INTO widget (id, name, description, category, icon_url, file_url, image_hint, downloads, size_bytes, whats_new, more_info, created_by_id)
VALUES
(5, 'SoundWeave',
 'Discover and share music with a next-gen social music platform.',
 'Music',
 'https://picsum.photos/400/225?random=5',
 'https://example.com/widgets/soundweave.zip',
 'music waveform',
 7234,
 5242880,
 '**Version 4.1.0**
Integration with major streaming services. Enhanced playlist sharing with collaborative editing. New audio visualization modes.',
 '| Key | Value |
| --- | --- |
| **Version** | 4.1.0 |
| **Languages** | English, Spanish, Portuguese |
| **Permissions** | Audio, Network Access |
| **Developer** | SoundWave Media |
| **Website** | [soundwave.fm](https://soundwave.fm) |',
 NULL);

INSERT INTO widget (id, name, description, category, icon_url, file_url, image_hint, downloads, size_bytes, whats_new, more_info, created_by_id)
VALUES
(6, 'TaskMaster',
 'The ultimate to-do list and project management tool for power users.',
 'Productivity',
 'https://picsum.photos/400/225?random=6',
 'https://example.com/widgets/taskmaster.zip',
 'kanban board',
 4567,
 2621440,
 '**Version 3.2.1**
Kanban boards with drag-and-drop. Gantt charts for project timelines. Team collaboration features with real-time updates.',
 '| Key | Value |
| --- | --- |
| **Version** | 3.2.1 |
| **Languages** | English, German, French |
| **Permissions** | Notifications, Sync |
| **Developer** | Productivity Plus |
| **Website** | [productivityplus.io](https://productivityplus.io) |',
 NULL);

-- Insert tags
INSERT INTO widget_tags (widget_id, tag) VALUES
(1, 'time management'), (1, 'calendar'), (1, 'analytics'),
(2, 'social media'), (2, 'friends'), (2, 'updates'),
(3, 'weather'), (3, 'forecast'), (3, 'alerts'),
(4, 'development'), (4, 'coding'), (4, 'testing'),
(5, 'music'), (5, 'streaming'), (5, 'playlist'),
(6, 'tasks'), (6, 'projects'), (6, 'kanban');

-- Insert key features
INSERT INTO widget_features (widget_id, feature, position) VALUES
(1, 'Seamless calendar integration with Google and Outlook', 0),
(1, 'Real-time time tracking with automatic detection', 1),
(1, 'Detailed analytics and productivity reports', 2),
(1, 'Customizable themes and layout options', 3),
(1, 'Offline mode for uninterrupted tracking', 4),

(2, 'Unified dashboard for all social networks', 0),
(2, 'Smart notification filtering', 1),
(2, 'Schedule posts across multiple platforms', 2),
(2, 'Advanced privacy controls', 3),
(2, 'Dark mode support', 4),

(3, 'Hyper-local weather forecasts', 0),
(3, 'Severe weather alerts and notifications', 1),
(3, 'Interactive weather radar with 3D visualization', 2),
(3, 'Pollen and air quality tracking', 3),
(3, '10-day extended forecast', 4),

(4, 'Support for 50+ programming languages', 0),
(4, 'Instant code execution in sandbox', 1),
(4, 'Syntax highlighting and auto-completion', 2),
(4, 'Code sharing and collaboration', 3),
(4, 'Built-in version control', 4),

(5, 'Integration with major streaming services', 0),
(5, 'Collaborative playlist editing', 1),
(5, 'Advanced audio visualizations', 2),
(5, 'Social music discovery', 3),
(5, 'Offline playback support', 4),

(6, 'Kanban boards with drag-and-drop', 0),
(6, 'Gantt charts for project planning', 1),
(6, 'Team collaboration in real-time', 2),
(6, 'Recurring tasks and reminders', 3),
(6, 'Cross-platform synchronization', 4);

-- Reset sequence for auto-increment
-- PostgreSQL sequence reset
SELECT setval('widget_id_seq', (SELECT MAX(id) FROM widget));
