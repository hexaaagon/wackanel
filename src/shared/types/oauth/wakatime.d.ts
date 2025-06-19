export type User = {
  id: string; // unique id of user
  bio: string; // optional user defined bio
  has_premium_features: boolean; // true if user has access to premium features
  display_name: string; // display name of this user taken from full_name or @username. Defaults to 'Anonymous User'
  full_name: string; // full name of user
  email: string; // email address
  photo: string; // url of photo for this user
  is_email_public: boolean; // whether this user's email should be shown on the public leader board
  is_email_confirmed: boolean; // whether this user's email address has been verified with a confirmation email
  public_email: string | null; // email address for public profile. Nullable.
  photo_public: boolean; // whether this user's photo should be shown on the public leader board
  timezone: string; // user's timezone in Olson Country/Region format
  last_heartbeat_at: string; // time of most recent heartbeat received in ISO 8601 format
  last_plugin: string; // user-agent string from the last plugin used
  last_plugin_name: string; // name of editor last used
  last_project: string; // name of last project coded in
  last_branch: string; // name of last branch coded in
  plan: string; // users subscription plan
  username: string; // users public username
  website: string; // website of user
  human_readable_website: string; // website of user without protocol part
  wonderfuldev_username: string; // wonderful.dev username of user
  github_username: string; // GitHub username of user
  twitter_username: string; // Twitter handle of user
  linkedin_username: string; // Linkedin username of user
  city: {
    country_code: string; // two letter code, for ex: US or UK
    name: string; // city name, for ex: San Francisco
    state: string; // state name, for ex: California
    title: string; // city, state (or country if state has same name as city)
  };
  logged_time_public: boolean; // coding activity should be shown on the public leader board
  languages_used_public: boolean; // languages used should be shown on the public leader board
  editors_used_public: boolean; // editors used shown on public profile
  categories_used_public: boolean; // categories used shown on public public
  os_used_public: boolean; // operating systems used shown on public public
  is_hireable: boolean; // user preference showing hireable badge on public profile
  created_at: string; // time when user was created in ISO 8601 format
  modified_at: string; // time when user was last modified in ISO 8601 format
};
