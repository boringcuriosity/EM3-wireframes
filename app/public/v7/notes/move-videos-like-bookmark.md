# Move videos: what the heart and bookmark actually do

Research for the video card redesign in Move > Learn > Videos. Sources are local clones of the live repos (no browser used):

- Web app (app.goodflip.in): `/Users/shaheer/Documents/GF/app.goodflip.in` (last commit 2026-06-22)
- Native app (MyTatva RN): `/Users/shaheer/Documents/GF/MyTatva-RN` (last commit 2026-06-04)
- Backend (MyTatvaCore, Node): `/Users/shaheer/Documents/GF/MyTatvaCore` (last commit 2026-05-15)
- GoodFlip Design System MCP: nothing on bookmark or saved flows, only the icon rule (line icons, filled when active) and "confirm with a toast like Saved".

## 1. Heart (like)

Answer: a per-user like toggle with a global public count. Confidence: high.

- Card: `app.goodflip.in/src/components/molecules/exercise/ExerciseVideoCard/index.tsx`. Tap calls `toggleVideoLike` with `{content_master_id, is_active: "Y" | "N"}`, flips the filled heart and adds or removes 1 from the count on screen. The count is hidden when it is 0. Heart and bookmark are hidden in `view_only` mode.
- API: `src/api/exercise.ts`, `POST /content/update_likes`.
- Backend: `MyTatvaCore/api/modules/v8/content/Content_model.js` `update_likes` (around line 1028). It writes a row per patient in `content_like_rel` (`like_by` = patient) and increments or decrements `content_master.no_of_likes`. So the number is the total across all users.
- Per-user state comes back as `liked: "Y" | "N"` (left join on `content_like_rel` for this patient).
- Side effect: `no_of_likes DESC` (and `no_of_bookmark DESC`) are tie-breakers in the video list sort order (`exercise_list` and `exercise_list_by_genre_id`), after sort order, priority, doctor or coach recommended and created date. So likes nudge ranking slightly. Nothing else found that uses likes (no feed, no profile, no score).
- Capability flag `like_capability` exists in the payload but the web card ignores it.

## 2. Bookmark

Answer: a per-user save toggle. The web app has no screen to see saved videos again. The native app has one, under the side drawer. Confidence: high.

- Card: same file. Tap calls `toggleVideoBookmark`, `POST /content/update_bookmarks`. No toast, no count shown.
- Backend: `update_bookmarks` (around line 952) writes `content_bookmark_rel` (`bookmark_by` = patient) and bumps `content_master.no_of_bookmark` (a global count, never displayed). Per-user state is `bookmarked: "Y" | "N"`.
- Where saved items show up:
  - Web app (app.goodflip.in): nowhere. Searching `src` for "bookmark" only hits the card, the icon, the types, the API and the two video screens. No call to `bookmark_content_list`. Bookmarking on web is a dead end today.
  - Native app: side drawer > My Health Diary > "Bookmarks" (`MyTatva-RN/src/components/molecules/DrawerMyHealthDiary.tsx`, `src/screens/Drawer/MyHealthDiary/BookmarksScreen.tsx`, `ViewAllBookmarks.tsx`). It calls `POST /content/bookmark_content_list`, which returns groups by type: Video, BlogArticle, Photo, Webinar, ExerciseVideo, AskAnExpert, each with "View all" (`bookmark_content_list_by_type`). So exercise videos share one bookmark store with the older Learn content (articles, videos, webinars).
  - A Bookmarks tab in the newer nested bottom nav is commented out (`src/components/organisms/nestedBottomNavConfig.ts`).
- FlipFeed is separate. FlipFeed bookmarks live in WordPress (`/wp-json/v1/fetch-user-saved-posts?type=bookmark`, `src/api/flipfeed.ts`) and have their own `src/screens/FlipFeed/BookmarksScreen.tsx`. A saved exercise video will not appear in FlipFeed saved, and the reverse.

## 3. Video duration in the data

Answer: yes, `time_duration` with `duration_unit` on the content record. Confidence: medium-high.

- The list queries return `cm.*` from `content_master`, so every video object carries `time_duration` and `duration_unit` (typed in `MyTatva-RN/src/types/exercise.ts`, `Content` type: `time_duration: number; duration_unit: string`). The backend also filters on it (`cm.time_duration >= ... <= ...` via the `show_time` filter, `content_time_filter` table).
- The web app strips it: `modifyAllVideosResponse` in `ExerciseVideoScreen` and `ExerciseMoreVideoPage` keeps only 17 fields, and duration is not one of them. Showing it on web is a one-line front-end change.
- Unknown: whether ops fill it for every video, and the unit in practice. Check a real response before relying on it. Separate plan fields exist too (`duration`, `duration_unit`, `exercise_duration`) but those are the prescribed time in an exercise plan, not the clip length.

## 4. "View More"

Answer: a per-genre full list. Confidence: high.

- `src/components/atoms/Layout/ScrollExpandLayout.tsx` shows the genre title with "View More" over a horizontal carousel of cards. Genres with only one video (and "Exercise of the week") render as a single full-width card with no View More.
- Tap goes to `/exercise/more-videos` (`src/pages/ExerciseMoreVideoPage/index.tsx`): header with the genre name and back, then a vertical list of the same full-width cards for that genre, from `POST /content/exercise_list_by_genre_id` (paged, but only page 1 is fetched). Info opens a bottom sheet with title and description.

## Recommendation

Card:
- Put the bookmark on the thumbnail, top right, as a circle button over the image. It is the action people want while browsing, and it does not compete with the title.
- Put the heart with its count in the meta row under the title, after the duration ("8 min · ♥ 124"). Hide the count below a threshold (say 10) so new videos do not read as unpopular. Show duration from `time_duration` once BE confirms it is filled.
- Drop the info icon: show the description on the card or in the player. Fold "fitness level" and "tools" into the same meta row as plain text, not chips.
- On save, a short toast "Saved to your videos", per the design system rule.

Finding saved videos (pick one):
- A. Saved row at the top of Videos (recommended). A horizontal "Saved" carousel, shown only when the user has at least one save, with its own "See all". Saves are visible where they were made, zero new navigation, and it disappears for people who never save.
- B. A "Saved" filter chip next to genre chips. Cheaper to build, but hidden until tapped, and it reads as a filter not a place.
- C. Rely on the drawer Bookmarks screen. Exists on native only, mixes articles and webinars, and web has nothing. Not enough on its own.

Data for A already exists: `POST /content/bookmark_content_list_by_type` with `type: "ExerciseVideo"` returns just this user's saved exercise videos, so no backend work is needed.
